const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account')

router.get("/login",accountController.getLogin);
router.post("/login",accountController.postLogin);

router.get("/register",accountController.getRegister);
router.post("/register",accountController.postRegister);

router.get("/logout",accountController.getLogout)

module.exports=router