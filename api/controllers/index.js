'use strict';

const authController = require('./authController');

const coachController = require('./coachController');

const coacheeController = require('./coacheeController');

const habitController = require('./habitController');
const habitlistRecordController = require('./habitlistRecordController');
const indicatorController = require('./indicatorController');
const indicatorRecordController = require('./indicatorRecordController');
const challengeController = require('./challengeController');
const chatController = require('./chatController');
const unreadNotificationController = require('./unreadNotificationController');
const membershipController = require('./membershipController');
const healthyTipController = require('./healthyTipController');
const memberRecordController = require('./memberRecordController');
const companyCodeController=require('./companyCodeController');
const categoryController=require('./categoryController');
const noteController=require('./noteController')
module.exports = {
    authController,
    coachController,
    coacheeController,
    habitController,
    habitlistRecordController,
    indicatorController,
    indicatorRecordController,
    challengeController,
    chatController,
    unreadNotificationController,
    membershipController,
    healthyTipController,
    memberRecordController,
    companyCodeController,
    categoryController,
    noteController
};