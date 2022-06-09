const CustomError = require('../errors')
const {isTokenValid, attachCookiesToResponse} = require('../utils')
const Token = require('../models/Token')


const authenticateUser = async (req, res, next) => {
    const {refreshToken, accessToken} = req.signedCookies;

    try {
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            req.user = payload.user;
            return next();
        }

        const payload = isTokenValid(refreshToken);

        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken
        })

        if (!existingToken || !existingToken?.isValid) {
            throw new CustomError.UnauthenticatedError('Authentication Failed')
        }

        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken
        })

        req.user = payload.user;

        next();

    } catch (e) {
        throw new CustomError.UnauthenticatedError('Authentication Failed')
    }
}


const authorisePermissions = (...roles) => {
    return (req, res, next) => {
        console.log(roles);
        if (!roles.includes(req.user.role)) {
            throw new CustomError.UnauthorisedError('Unauthorised to access this route')
        }
        next();
    }
}


module.exports = {
    authenticateUser,
    authorisePermissions
};