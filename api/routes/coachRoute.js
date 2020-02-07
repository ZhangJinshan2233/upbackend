const express = require('express');

const Router = express.Router();
const passport = require('passport')
const {
    coachController
} = require('../controllers');
Router
    .route('')
    .get(coachController.get_coaches_pagination)
    .post(coachController.signup)
Router
    .route('/count')
    .get(coachController.get_coach_total_numbers)
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
    .get(coachController.get_coach)
    .post(coachController.update_coach)
module.exports = Router;