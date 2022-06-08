const express = require('express')
const router = express.Router();

const {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    uploadImage
} = require('../controllers/productController')

const {authenticateUser, authorisePermissions} = require('../middleware/authentication')

router.route('/')
    .get(getAllProducts)
    .post([authenticateUser, authorisePermissions('admin')], createProduct);

router.route('/uploadImage')
    .post(authenticateUser, authorisePermissions('admin'), uploadImage)

router.route('/:id')
    .get(getSingleProduct)
    .patch(authenticateUser, authorisePermissions('admin'), updateProduct)
    .delete(authenticateUser, authorisePermissions('admin'), deleteProduct);



module.exports = router;