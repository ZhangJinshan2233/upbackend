const {
    companyCodeController
} = require('../controllers');

const Router = require('express').Router()

Router
    .route('')
    .post(companyCodeController.create_company_code)
    .get(companyCodeController.get_company_code)

module.exports = Router