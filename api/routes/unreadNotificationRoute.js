const {
    unreadNotificationController
} = require('../controllers');
const Router = require('express').Router()
const passport = require('passport')
Router
    .route('')
    .get(passport.authenticate('jwt', {
        session: false
    }), unreadNotificationController.get_unread_notifications)
    .delete(passport.authenticate('jwt', {
        session: false
    }), unreadNotificationController.remove_notifications)

module.exports = Router