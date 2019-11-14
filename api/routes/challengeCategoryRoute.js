const Router = require('express').Router()

const {
    challengeCategoryController
} = require('../controllers')

Router
    .route('')
    .get(challengeCategoryController.get_challenge_categories)
    .post(challengeCategoryController.create_challenge_category)
    .put(challengeCategoryController.update_challenge_category)

    Router
    .route('/:challengeCategoryId')
    .get(challengeCategoryController.get_challengeCategory_by_id)
module.exports = Router