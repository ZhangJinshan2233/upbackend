const Router = require('express').Router()

const {
    categoryController
} = require('../controllers')

Router
    .route('')
    .post(categoryController.create_category)
    .get(categoryController.get_categories)
Router
    .route('/count')
    .get(categoryController.get_categories_total_numbers)
Router
    .route('/kind')
    .get(categoryController.get_categories_by_kind)
    
Router
    .route('/distinctKind')
    .get(categoryController.get_kinds)

Router
    .route('/:categoryId')
    .get(categoryController.get_category_by_id)
    .put(categoryController.update_category)



module.exports = Router