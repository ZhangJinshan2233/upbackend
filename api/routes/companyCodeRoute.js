const {
    companyCodeController
} = require('../controllers');

const Router = require('express').Router()

Router
    .route('')
    .post(companyCodeController.create_company_code)
    .get(companyCodeController.get_companyCodes_pagiantion)
Router
    .route('/count')
    .get(companyCodeController.get_companyCode_total_numbers)
Router
    .route('/:companyCodeId')
    .get(companyCodeController.get_companyCode)
    .put(companyCodeController.update_companyCode)

module.exports = Router