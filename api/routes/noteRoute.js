const Router = require('express').Router()
const passport = require('passport')
const {
    noteController
} = require('../controllers')

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), noteController.createDocument)
    .get( noteController.getAllDocuments)

Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }), noteController.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }), noteController.updateDocumentById)



module.exports = Router