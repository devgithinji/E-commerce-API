const CustomError = require('../errors')
const checkPermissions = (requestUser, resourceUserId) => {
    if(requestUser.role === 'admin') return;

    if(resourceUserId === resourceUserId.toString()) return;

    throw new CustomError.UnauthorisedError('Not authorised to access this route')
}

module.exports = checkPermissions;