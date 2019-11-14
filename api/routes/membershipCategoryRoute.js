const Router = require('express').Router()

const {
   membershipCategoryController
} = require('../controllers')

Router
    .route('')
    .get(membershipCategoryController.get_membership_categories)
    .post(membershipCategoryController.create_membership_category)
    .put(membershipCategoryController.update_membership_category)

    Router
    .route('/:membershipCategoryId')
    .get(membershipCategoryController.get_MembershipCategory_by_id)
module.exports = Router