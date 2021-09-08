const express = require('express');
const router = express.Router();

const accountController = require('../controllers/account')

const isAuthenticated = require('../middleware/authentication');
const locals = require('../middleware/locals');

router.get("/login",locals, accountController.getLogin);
router.post("/login", accountController.postLogin);

router.get("/register", locals, accountController.getRegister);
router.post("/register",accountController.postRegister);

router.get("/logout",isAuthenticated,accountController.getLogout)

router.get('/reset-password',locals,accountController.getReset);
router.post('/reset-password',locals,accountController.postReset);

router.get('/reset-password/:token',locals,accountController.getNewPassword);
router.post('/new-password',locals,accountController.postNewPassword);

module.exports=router