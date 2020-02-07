const Router = require('express').Router()

const {
    healthyTipController
} = require('../controllers')

Router
    .route('')
    .get(healthyTipController.get_healthyTips_pagination)
    .post(healthyTipController.create_healthy_tip)

Router
    .route('/count')
    .get(healthyTipController.get_healthytips_total_numbers)

Router
    .route('/admin')
    .get(healthyTipController.admin_get_healthyTips_pagination)
    
Router
    .route('/:healthyTipId')
    .get(healthyTipController.get_healthyTip_by_id)
    .put(healthyTipController.update_healthy_tip)

module.exports = Router