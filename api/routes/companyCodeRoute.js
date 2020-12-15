const {
    companyCodeController
} = require('../controllers');
const passport = require('passport');
const Router = require('express').Router()

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }),companyCodeController.createDocument)
    .get(passport.authenticate('jwt', {
        session: false
    }),companyCodeController.getAllDocuments)
Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }),companyCodeController.getTotalNumbersOfDocuments)
Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }),companyCodeController.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }),companyCodeController.updateDocumentById)

module.exports = Router