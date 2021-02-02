const {
    programmeRecordController: programmeCtrl
} = require('../controllers')
const Router = require('express').Router();
const passport = require('passport')
Router
Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), programmeCtrl.createDocument)
    .get(passport.authenticate('jwt', {
        session: false
    }), programmeCtrl.getDocuments)

Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }), programmeCtrl.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }), programmeCtrl.updateDocumentById)


module.exports = Router