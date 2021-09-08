const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

const isAuthenticated = require('../middleware/authentication');

router.get("/",isAuthenticated, shopController.getIndex);

router.get("/products",isAuthenticated, shopController.getProducts)

router.get("/products/:productid",isAuthenticated, shopController.getProduct)

router.get("/categories/:categoryname",isAuthenticated, shopController.getByCategory)


module.exports = router