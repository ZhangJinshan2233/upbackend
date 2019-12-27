const Router = require('express').Router()
const passport = require('passport')
const {
    habitlistRecordController
} = require('../controllers')

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), habitlistRecordController.create_habit_record)
    .get(passport.authenticate('jwt', {
        session: false
    }), habitlistRecordController.get_habitlist_record_of_day)

Router
    .route('/updateTodayHabits')
    .put(passport.authenticate('jwt', {
        session: false
    }), habitlistRecordController.update_current_habit_record)

Router
    .route('/search/week/:coacheeId')
    .get(habitlistRecordController.get_habitlist_record_of_current_week)

Router
    .route('/:habitlistId')
    .put(passport.authenticate('jwt', {
        session: false
    }), habitlistRecordController.update_habit_status)

module.exports = Router