const {
    challengeController
} = require('../controllers');
const passport = require('passport')
const Router = require('express').Router()

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), challengeController.createChallenge)

Router
    .route('/active')
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.getActiveChallenges)
Router
    .route('/nonactive')
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.getNonactiveChallenges)

Router
    .route('/:challengeId/posts')
    .post(passport.authenticate('jwt', {
        session: false
    }), challengeController.createNewPost)
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.getPostsByPagination)

Router
    .route('/posts/:postId/comments')
    .post(passport.authenticate('jwt', {
        session: false
    }), challengeController.creatNewComment)
    .get(passport.authenticate('jwt', {
        session: false
    }), challengeController.getCommentsByPostId)
    
Router
    .route('/posts/:postId/rating')
    .put(passport.authenticate('jwt', {
        session: false
    }), challengeController.ratePost)
module.exports = Router