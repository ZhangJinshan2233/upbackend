const {
    indicatorController
} = require('../controllers');

const Router = require('express').Router()

Router
    .route('')
    .post(indicatorController.create_indicator)
    .get(indicatorController.get_indicators)

Router
    .route('/count')
    .get(indicatorController.get_indicator_total_numbers)
    
Router

    .route('/:indicatorId')
    .put(indicatorController.update_indicator)
    .get(indicatorController.get_indicator_by_indicator_id)

module.exports = Router