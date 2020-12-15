'use strict'
const authRoute = require('./authRoute');
const coacheeRoute = require('./coacheeRoute');
const coachRoute = require('./coachRoute');
const indicatorRoute = require('./indicatorRoute');
const indicatorRecordRoute = require('./indicatorRecordRoute');
const challengeRoute = require('./challengeRoute');
const chatRoute = require('./chatRoute');
const unreadNotificationRoute = require('./unreadNotificationRoute');
const memberRoute = require('./memberRoute');
const companyCodeRoute = require('./companyCodeRoute');
const categoryRoute = require('./categoryRoute');
const noteRoute=require('./noteRoute');
const videoRoute=require('./videoRoute');
const articleRoute=require('./articleRoute')
const programmeRoute=require('./programmeRoute');
const scheduledProgrammeRoute=require('./scheduledProgrammeRoute')

module.exports = {
    authRoute,
    coachRoute,
    coacheeRoute,
    indicatorRoute,
    indicatorRecordRoute,
    challengeRoute,
    chatRoute,
    unreadNotificationRoute,
    memberRoute,
    companyCodeRoute,
    categoryRoute,
    noteRoute,
    videoRoute,
    articleRoute,
    programmeRoute,
    scheduledProgrammeRoute
}