const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

const isAuthenticated = require('../middleware/authentication');
const locals = require('../middleware/locals');

router.get("/",locals, shopController.getIndex);

router.get("/products",locals, shopController.getProducts)

router.get("/products/:productid",locals, shopController.getProduct)

router.get("/categories/:categoryname",locals, shopController.getByCategory)




module.exports = router