const {
    membershipController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
.route('')
.post(membershipController.create_membership)

module.exports=Router