'use strict';
const articleController =require('./articleController')
const videoController = require('./videoController')
//class instantiation
const authController = require('./authController');
const coachController = require('./coachController');
const coacheeController = require('./coacheeController');
const indicatorController = require('./indicatorController');
const indicatorRecordController = require('./indicatorRecordController');
const challengeController = require('./challengeController');
const chatController = require('./chatController');
const unreadNotificationController = require('./unreadNotificationController');
const memberController = require('./memberController')();
const companyCodeController = require('./companyCodeController');
const categoryController = require('./categoryController');
const noteController = require('./noteController')
const programmeController = require('./programmeController')
const scheduledProgrammeController = require('./scheduledProgrammeController')

module.exports = {
    authController,
    coachController,
    coacheeController,
    indicatorController,
    indicatorRecordController,
    challengeController,
    chatController,
    unreadNotificationController,
    memberController,
    companyCodeController,
    categoryController,
    noteController,
    videoController,
    articleController,
    programmeController,
    scheduledProgrammeController
};