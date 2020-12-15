const Router = require('express').Router()
const passport = require('passport')
const {
    categoryController
} = require('../controllers')

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }),categoryController.create_category)
    .get(passport.authenticate('jwt', {
        session: false
    }),categoryController.get_categories)
Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }),categoryController.get_categories_total_numbers)
Router
    .route('/kind')
    .get(passport.authenticate('jwt', {
        session: false
    }),categoryController.get_categories_by_kind)
    
Router
    .route('/distinctKind')
    .get(passport.authenticate('jwt', {
        session: false
    }),categoryController.get_kinds)

Router
    .route('/:categoryId')
    .get(passport.authenticate('jwt', {
        session: false
    }),categoryController.get_category_by_id)
    .put(passport.authenticate('jwt', {
        session: false
    }),categoryController.update_category)



module.exports = Router