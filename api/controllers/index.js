'use strict';

const authController = require('./authController');

const coachController = require('./coachController');

const coacheeController = require('./coacheeController');

const habitCategoryController = require('./habitCategoryController');

const habitController = require('./habitController');

const timelinePostController = require('./timelinePostController');

const habitlistRecordController = require('./habitlistRecordController');
const indicatorController = require('./indicatorController');
const indicatorRecordController = require('./indicatorRecordController');
const challengeCategoryController = require('./challengeCategoryController');
const challengeController = require('./challengeController');
const chatController = require('./chatController');
const unreadNotificationController = require('./unreadNotificationController');
const membershipCategoryController = require('./membershipCategoryController');
const membershipController = require('./membershipController');
const healthyTipController = require('./healthyTipController');
const memberRecordController = require('./memberRecordController');
module.exports = {
    authController,
    coachController,
    coacheeController,
    habitCategoryController,
    habitController,
    timelinePostController,
    habitlistRecordController,
    indicatorController,
    indicatorRecordController,
    challengeCategoryController,
    challengeController,
    chatController,
    unreadNotificationController,
    membershipCategoryController,
    membershipController,
    healthyTipController,
    memberRecordController
};