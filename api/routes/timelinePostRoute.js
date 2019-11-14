'use strict'
const express = require('express');

const router = express.Router();

const {
    timelinePostController
} = require('../controllers');

router
    .route('')
    .post(timelinePostController.create_new_post)
    .get(timelinePostController.get_timeline_post)

router
    .route('/:postId/comments')
    .get(timelinePostController.get_commments)
    .post(timelinePostController.create_new_comment)

module.exports = router