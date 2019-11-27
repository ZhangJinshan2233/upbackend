const Router = require('express').Router()

const {
    categoryController
} = require('../controllers')

Router
    .route('')
    .post(categoryController.create_category)
    .get(categoryController.get_categories)

Router
    .route('/:categoryId')
    .get(categoryController.get_category_by_id)
    .put(categoryController.update_category)



module.exports = Router