const {
    membershipController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
    .route('')
    .get(membershipController.get_memberships)
Router
    .route('/count')
    .get(membershipController.get_membership_total_numbers)
module.exports = Router