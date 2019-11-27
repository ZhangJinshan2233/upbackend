'use strict'
const authRoute = require('./authRoute');
const coacheeRoute = require('./coacheeRoute');
const coachRoute = require('./coachRoute');
const habitRoute = require('./habitRoute');
const habitlistRecordRoute = require('./habitlistRecordRoute');
const indicatorRoute = require('./indicatorRoute');
const indicatorRecordRoute = require('./indicatorRecordRoute');
const challengeRoute = require('./challengeRoute');
const chatRoute = require('./chatRoute');
const unreadNotificationRoute = require('./unreadNotificationRoute');
const membershipRoute = require('./membershipRoute');
const healthyTipRoute = require('./healthyTipRoute');
const memberRecordRoute = require('./memberRecordRoute');
const companyCodeRoute = require('./companyCodeRoute');
const categoryRoute = require('./categoryRoute');
const noteRoute=require('./noteRoute')
module.exports = {
    authRoute,
    coachRoute,
    coacheeRoute,
    habitRoute,
    habitlistRecordRoute,
    indicatorRoute,
    indicatorRecordRoute,
    challengeRoute,
    chatRoute,
    unreadNotificationRoute,
    membershipRoute,
    healthyTipRoute,
    memberRecordRoute,
    companyCodeRoute,
    categoryRoute,
    noteRoute
}