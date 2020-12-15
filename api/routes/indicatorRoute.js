const {
    indicatorController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }),indicatorController.createDocument)
    .get(passport.authenticate('jwt', {
        session: false
    }),indicatorController.getAllDocuments)

Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }),indicatorController.getTotalNumbersOfDocuments)
    
Router

    .route('/:id')
    .put(passport.authenticate('jwt', {
        session: false
    }),indicatorController.updateDocumentById)
    .get(passport.authenticate('jwt', {
        session: false
    }),indicatorController.getDocumentById)

module.exports = Router