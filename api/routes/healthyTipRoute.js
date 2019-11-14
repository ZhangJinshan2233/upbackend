const Router = require('express').Router()

const {
    healthyTipController
} = require('../controllers')

Router
    .route('')
    .get(healthyTipController.get_healthyTips_pagination)
    .post(healthyTipController.create_healthy_tip)
Router
    .route('/:healthyTipId')
    .put(healthyTipController.update_healthy_tip)
module.exports = Router