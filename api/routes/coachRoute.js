const express = require('express');

const Router = express.Router();
const multer = require('multer');
const passport = require('passport')
const {
    coachController
} = require('../controllers');
Router
    .route('')
    .get(passport.authenticate('jwt', {
        session: false
    }),coachController.get_coaches_pagination)
    .post(passport.authenticate('jwt', {
        session: false
    }),multer().fields([{
        name: 'poster',
        maxCount: 1
    }]), coachController.signup)
Router
    .route('/count')
    .get(coachController.get_coach_total_numbers)

Router
    .route('/distinctKind')
    .get(coachController.getKinds)

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
    .get(coachController.getCoachById)
    .post(passport.authenticate('jwt', {
        session: false
    }),multer({
        limits: {
            fileSize: 1024 * 1024 * 8
        }
    }).fields([{
        name: 'poster',
        maxCount: 1
    }]),coachController.updateCoach)
module.exports = Router;