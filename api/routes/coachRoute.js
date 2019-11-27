const express = require('express');

const Router = express.Router();
const passport = require('passport')
const {
    coachController
} = require('../controllers');

Router
    .route('/signup')
    .post(coachController.signup);
Router
    .route('/coacheeList')
    .get(passport.authenticate('jwt', {
        session: false
    }), coachController.get_coachees_pagination)
Router
    .route('/coacheeList/count') //params of route sequence will affect the result
    .get(passport.authenticate('jwt', {
        session: false
    }), coachController.get_enrolled_and_expired_members)
Router
    .route('/coacheeList/:coacheeId')
    .get(passport.authenticate('jwt', {
        session: false
    }), coachController.get_coachee)
Router
    .route('/:coachId') //params of route sequence will affect the result
    .get(passport.authenticate('jwt', {
        session: false
    }), coachController.get_coach)


module.exports = Router;