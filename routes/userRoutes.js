const express = require('express')
const router = express.Router();
const {
    getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword
} = require('../controllers/userController')
const {authenticateUser, authorisePermissions} = require('../middleware/authentication')

router.route('/').get(authenticateUser, authorisePermissions('admin'), getAllUsers)
router.route('/profile').get(authenticateUser,showCurrentUser)
router.route('/updateUser').patch(authenticateUser,updateUser)
router.route('/updateUserPassword').patch(authenticateUser,updateUserPassword)
router.route('/:id').get(authenticateUser, authorisePermissions('admin'), getSingleUser)

module.exports = router;

