const passport = require('passport')
const Router = require('express').Router()
const {
    chatController,
    unreadMessageController
} = require('../controllers')
Router
    .route('/rooms/:roomName')
    .get(passport.authenticate('jwt', {
        session: false
    }), chatController.go_to_chat_room)
Router
    .route('/messages')
    .post(passport.authenticate('jwt', {
        session: false
    }), chatController.create_message)
Router
    .route('/messages/:chatRoomId')
    .get(passport.authenticate('jwt', {
        session: false
    }), chatController.get_messages_pagination_by_chatRoom)
module.exports = Router