'use strict'
const Router = require('express').Router()
const passport = require('passport')
const {
    coacheeController
} = require('../controllers');

Router
    .route('/signup')
    .post(coacheeController.signup);

Router
    .route('/addRecommendedHabits')
    .post(passport.authenticate('jwt', {
        session: false
    }), coacheeController.insert_recommended_habits)
Router
    .route('/:coacheeId')
    .get(passport.authenticate('jwt', {
        session: false
    }), coacheeController.get_coachee_by_coacheeId)
module.exports = Router;