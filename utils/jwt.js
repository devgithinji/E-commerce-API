const jwt = require('jsonwebtoken')

const createJWT = ({payload}) => {
    return jwt.sign(payload, process.env.JWT_SECRET);
}

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

const attachCookiesToResponse = ({res, user, refreshToken}) => {

    const accessTokenJWT = createJWT({payload: {user}});
    const refreshTokenJWT = createJWT({payload: {user, refreshToken}});

    const oneDay = 100 * 60 * 60 * 24;
    const longerExp = 100 * 60 * 60 * 24 * 30;

    res.cookie('accessToken', accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + oneDay)
    })

    res.cookie('refreshToken', refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + longerExp)
    })
}

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
}