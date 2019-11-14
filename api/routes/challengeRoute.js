const {
    challengeController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), challengeController.create_challenge)

Router
    .route('/active')
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.get_active_challenges)
Router
    .route('/nonactive')
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.get_nonactive_challenges)

Router
    .route('/:challengeId/posts')
    .post(passport.authenticate('jwt', {
        session: false
    }), challengeController.create_new_post)
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.get_foodjournalposts_pagination_by_challengeId)

Router
    .route('/posts/:postId/comments')
    .post(passport.authenticate('jwt', {
        session: false
    }), challengeController.create_new_comment)
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.get_comments_by_postId)
    
Router
    .route('/posts/:postId/rating')
    .put(passport.authenticate('jwt', {
        session: false
    }), challengeController.rate_post)
module.exports = Router