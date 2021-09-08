const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account')

const isAuthenticated = require('../middleware/authentication');
const csrf = require('../middleware/csrf');

router.get("/login",csrf, accountController.getLogin);
router.post("/login", accountController.postLogin);

router.get("/register", csrf, accountController.getRegister);
router.post("/register",accountController.postRegister);

router.get("/logout",isAuthenticated,accountController.getLogout)

router.get('/reset-password',csrf,accountController.getReset);
router.post('/reset-password',csrf,accountController.postReset);

router.get('/reset-password/:token',csrf,accountController.getNewPassword);
router.post('/new-password',csrf,accountController.postNewPassword);

module.exports=router