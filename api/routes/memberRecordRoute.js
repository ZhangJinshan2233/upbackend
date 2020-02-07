const {
    memberRecordController
} = require('../controllers');

const Router = require('express').Router()

Router
    .route('')
    .get(memberRecordController.get_member_record_by_coachee)
    .post(memberRecordController.create_member_record)

module.exports = Router