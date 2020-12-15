'use strict'
const Router = require('express').Router()
const passport = require('passport')
const {
    coacheeController
} = require('../controllers');

Router
    .route('')
    .get(passport.authenticate('jwt', {
        session: false
    }),coacheeController.get_coachees_pagination)

Router
    .route('/signup')
    .post(coacheeController.signup);

Router
    .route('/batchupload')
    .post(passport.authenticate('jwt', {
        session: false
    }),coacheeController.multiple_signup)
    
Router
    .route('/count')
    .get(coacheeController.get_coachee_total_numbers)

Router
    .route('/assignCoach')
    .post(passport.authenticate('jwt', {
        session: false
    }),coacheeController.assign_coach)

Router
    .route('/assignGroup')
    .post(passport.authenticate('jwt', {
        session: false
    }),coacheeController.assign_group)
Router
    .route('/:coacheeId')
    .get(passport.authenticate('jwt', {
        session: false
    }),coacheeController.get_coachee_by_coacheeId)



module.exports = Router;