const Router = require('express').Router()
const {
    authController
} = require('../controllers');

const passport = require('passport')

Router
    .route('/signin')
    .post(authController.signin)

Router
    .route('/profile')
    .get(passport.authenticate('jwt', {
        session: false
    }), authController.get_whole_userInfo)

    .post(passport.authenticate('jwt', {
        session: false
    }), authController.update_profile_field)



Router
    .route('/changepassword')
    .post(passport.authenticate('jwt', {
        session: false
    }), authController.change_password);

Router
    .route('/forgotpassword')
    .post(authController.forgot_password)



module.exports = Router;