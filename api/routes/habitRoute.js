const Router = require('express').Router()
const passport = require('passport')
const {
    habitController
} = require('../controllers')

Router
    .route('')
    .get(passport.authenticate('jwt', {
        session: false
    }), habitController.get_habits)
    .post(passport.authenticate('jwt', {
        session: false
    }), habitController.create_habit)

Router
    .route('/:habitId')
    .put(passport.authenticate('jwt', {
        session: false
    }), habitController.update_habit)

module.exports = Router