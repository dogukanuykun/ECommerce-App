const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shop');

const isAuthenticated = require('../middleware/authentication');
const csrf = require('../middleware/csrf');

router.get("/",csrf,isAuthenticated, shopController.getIndex);

router.get("/products",csrf,isAuthenticated, shopController.getProducts)

router.get("/products/:productid",csrf,isAuthenticated, shopController.getProduct)

router.get("/categories/:categoryname",csrf,isAuthenticated, shopController.getByCategory)


module.exports = router