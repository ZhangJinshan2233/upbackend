const {
    scheduledProgrammeController: schProgrammeCtrl
} = require('../controllers')
const Router = require('express').Router();
const passport = require('passport')
Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.createDocument)
    .get(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.getAllDocuments)
Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.getTotalNumbersOfDocuments)

Router
    .route('/batchUpload')
    .post(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.batchUploadProgrammes)
Router
    .route('/coachee/search')
    .get(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.userGetProgrammes)
Router
    .route('/coachee/search/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.userGetProgrammeById)
Router
    .route('/sendRecuritEmails')
    .post(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.sendRecruitEmails)
Router
    .route('/sendReminderEmails')
    .post(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.sendReminderEmails)

Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.updateDocumentById)
Router
    .route('/:id/comments')
    .post(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.createComment)
    .get(passport.authenticate('jwt', {
        session: false
    }), schProgrammeCtrl.getCommentByUserId)

module.exports = Router;