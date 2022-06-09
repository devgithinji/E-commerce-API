const User = require('../models/User')
const Token = require('../models/Token')
const {StatusCodes} = require('http-status-codes')
const CustomError = require('../errors')
const {
    attachCookiesToResponse,
    createTokenUser,
    sendVerificationEmail,
    sendResetPassword,
    createHash
} = require('../utils')
const crypto = require('crypto')


const register = async (req, res) => {
    const {email, name, password} = req.body;
    const emailAlreadyExists = await User.findOne({email});
    if (emailAlreadyExists) {
        throw  new CustomError.BadRequestError('email already exists')
    }
    //first registered user is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const verificationToken = crypto.randomBytes(40).toString('hex');

    const user = await User.create({name, email, password, role, verificationToken});

    //send verification token
    sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin: process.env.ORIGIN
    })

    res.status(StatusCodes.CREATED).json({
        msg: 'Success please check your email to verify account'
    });
}

const verifyEmail = async (req, res) => {
    const {verificationToken, email} = req.body;

    const user = await User.findOne({email})

    if (!user) {
        throw  new CustomError.UnauthenticatedError('Email verification failed')
    }

    if (user.verificationToken !== verificationToken) {
        throw  new CustomError.UnauthenticatedError('Email verification failed')
    }

    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = ''

    await user.save();

    res.status(StatusCodes.OK).json({msg: 'Email verified'})
}

const login = async (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        throw new CustomError.BadRequestError('Please provide email and password');
    }

    const user = await User.findOne({email});

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid credentials');
    }

    if (!user.isVerified) {
        throw new CustomError.UnauthenticatedError('Please verify your email');
    }

    const tokenUser = createTokenUser(user)

    //create refresh token
    let refreshToken = '';

    //check for existing token
    const existingToken = await Token.findOne({user: user._id});

    if (existingToken) {
        const {isValid} = existingToken;
        if (!isValid) {
            throw new CustomError.UnauthenticatedError('Invalid credentials');
        }

        refreshToken = existingToken.refreshToken;

    } else {

        refreshToken = crypto.randomBytes(40).toString('hex');
        const userAgent = req.headers['user-agent']
        const ip = req.ip;
        const userToken = {refreshToken, ip, userAgent, user: user._id};

        await Token.create(userToken);

    }

    attachCookiesToResponse({res, user: tokenUser, refreshToken})

    res.status(StatusCodes.OK).json({user: tokenUser});
}

const logout = async (req, res) => {

    await Token.findOneAndDelete({user: req.user.userId})

    res.cookie('accessToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.cookie('refreshToken', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now())
    })

    res.status(StatusCodes.OK).json({msg: 'logged out successfully'})
}

const forgetPassword = async (req, res) => {
    const {email} = req.body;
    if (!email) {
        throw  new CustomError.BadRequestError('Please provide a valid email')
    }

    const user = await User.findOne({email})

    if (user) {
        const passwordToken = crypto.randomBytes(70).toString('hex');

        //send email
        sendResetPassword({
            name: user.name,
            email: user.email,
            token: passwordToken,
            origin: process.env.ORIGIN
        })

        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

        user.passwordToken = createHash(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;

        await user.save();
    }

    res.status(StatusCodes.OK).json({msg: 'Please check your email for password reset link'})
}

const resetPassword = async (req, res) => {
    const {token, email, password} = req.body;
    if (!token || !email || !password) {
        throw  new CustomError.BadRequestError('Please provide all required values ')
    }

    const user = await User.findOne({email})

    if (user) {
        const currentDate = new Date();
        if (user.passwordToken === createHash(token) && user.passwordTokenExpirationDate > currentDate) {
            user.password = password;
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null
            await user.save();
        }
    }

    res.send('reset password')
}

module.exports = {
    register,
    verifyEmail,
    login,
    logout,
    forgetPassword,
    resetPassword
}