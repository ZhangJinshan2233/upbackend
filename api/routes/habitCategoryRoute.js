const Router = require('express').Router()

const {
    habitCategoryController
} = require('../controllers')

Router
    .route('')
    .get(habitCategoryController.get_habit_categories)
    .post(habitCategoryController.create_habit_category)
    .put(habitCategoryController.update_habit_category)
module.exports = Router