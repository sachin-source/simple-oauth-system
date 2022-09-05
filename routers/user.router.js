const express = require('express');
const router = express.Router();

const userController = require("../controllers/user.controller")

router.route('/signup').post(userController.signUp);
router.route('/signup/otp').get(userController.signUp);
router.route('/signup/password').post(userController.signUp);

router.route('/login').post(userController.login);

router.route('/forgetpassword/email').post(userController.login);
router.route('/forgetpassword/otp').post(userController.login);
router.route('/forgetpassword/password').post(userController.login);


module.exports = router;