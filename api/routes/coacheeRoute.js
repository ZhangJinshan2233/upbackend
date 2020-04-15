'use strict'
const Router = require('express').Router()
const passport = require('passport')
const {
    coacheeController
} = require('../controllers');

Router
    .route('')
    .get(coacheeController.get_coachees_pagination)

Router
    .route('/signup')
    .post(coacheeController.signup);

Router
    .route('/batchupload')
    .post(coacheeController.multiple_signup)
    
Router
    .route('/count')
    .get(coacheeController.get_coachee_total_numbers)

Router
    .route('/assignCoach')
    .post(coacheeController.assign_coach)

Router
    .route('/assignGroup')
    .post(coacheeController.assign_group)

Router
    .route('/addRecommendedHabits')
    .post(passport.authenticate('jwt', {
        session: false
    }), coacheeController.insert_recommended_habits)

Router
    .route('/:coacheeId')
    .get(coacheeController.get_coachee_by_coacheeId)



module.exports = Router;