const {
    memberController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), memberController.createDocument)

Router
    .route('/record')
    .get(passport.authenticate('jwt', {
        session: false
    }), memberController.getMemberRecordByUserId)

Router
    .route('/transactions')
    .get(passport.authenticate('jwt', {
        session: false
    }), memberController.getMemberTransactions)

Router
    .route('/transactions/count')
    .get(passport.authenticate('jwt', {
        session: false
    }), memberController.getMemberTransactionNumbers)
module.exports = Router