const {
    indicatorRecordController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.create_indicator_record)
    .get(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.get_latest_record_of_all_indicators)

Router
    .route('/batchupload')
    .post(indicatorRecordController.insert_multiple_coachees_records)
Router
    .route('/pagination/:indicatorName')
    .get(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.get_record_by_name_and_pagination)

Router
    .route('/search/year/:indicatorName')
    .get(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.get_year_record_by_indicator_name)

Router
    .route('/search/month/:indicatorName')
    .get(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.get_month_record_by_indicator_name)
Router
    .route('/search/latest/:indicatorName')
    .get(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.find_latest_record_by_indicator_name)
Router
    .route('/:indicatorId')
    .put(passport.authenticate('jwt', {
        session: false
    }), indicatorRecordController.update_record_by_id)
module.exports = Router