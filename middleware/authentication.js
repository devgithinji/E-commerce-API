const CustomError = require('../errors')
const {isTokenValid} = require('../utils')


const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;
    if (!token) {
        throw new CustomError.UnauthenticatedError('Authentication Failed')
    }

    try {
        const {name, userId, role} = isTokenValid({token})
        req.user = {name, userId, role}
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