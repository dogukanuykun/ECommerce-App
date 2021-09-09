const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

const isAuthenticated = require('../middleware/authentication');
const locals = require('../middleware/locals');

router.get("/",locals, shopController.getIndex);

router.get("/products/:productid",locals, shopController.getProduct)

router.get("/categories/:categoryname",locals, shopController.getByCategory)

router.get('/cart', isAuthenticated, shopController.getCart);

router.post('/cart', isAuthenticated, shopController.postCart);

router.post('/delete-cartitem', locals, isAuthenticated, shopController.postCartItemDelete);

router.get('/orders', locals, isAuthenticated, shopController.getOrders);

router.post('/create-order', locals, isAuthenticated, shopController.postOrder);


module.exports = router