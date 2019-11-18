'use strict'
const authRoute = require('./authRoute');

const coacheeRoute = require('./coacheeRoute');

const coachRoute = require('./coachRoute');

const timelinePostRoute = require('./timelinePostRoute');

const habitCategoryRoute = require('./habitCategoryRoute');

const habitRoute = require('./habitRoute');

const habitlistRecordRoute = require('./habitlistRecordRoute');
const indicatorRoute = require('./indicatorRoute');
const indicatorRecordRoute = require('./indicatorRecordRoute');
const challengeCategoryRoute = require('./challengeCategoryRoute');
const challengeRoute = require('./challengeRoute');
const chatRoute = require('./chatRoute');
const unreadNotificationRoute = require('./unreadNotificationRoute');
const membershipCategoryRoute = require('./membershipCategoryRoute');
const membershipRoute = require('./membershipRoute');
const healthyTipRoute = require('./healthyTipRoute');
const memberRecordRoute = require('./memberRecordRoute')
module.exports = {
    authRoute,
    coachRoute,
    coacheeRoute,
    habitCategoryRoute,
    habitRoute,
    habitlistRecordRoute,
    timelinePostRoute,
    indicatorRoute,
    indicatorRecordRoute,
    challengeCategoryRoute,
    challengeRoute,
    chatRoute,
    unreadNotificationRoute,
    membershipCategoryRoute,
    membershipRoute,
    healthyTipRoute,
    memberRecordRoute
}