'use strict'
const express = require('express');
//use async/await syntax
require('express-async-errors');

const bodyParser = require('body-parser');

const morgan = require('morgan');

const passport = require('passport');

const routes = require('./routes')

const {
    passportMiddleware

} = require('./middlewares')

const cors = require('cors')

const app = express();

passportMiddleware(passport);

app.use(cors());

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 100000
}));

app.use(passport.initialize());
app.use(morgan('dev'));
// refer to routes
app.use('/api', routes.authRoute);
app.use('/api/habits', routes.habitRoute);
app.use('/api/indicatorRecords', routes.indicatorRecordRoute);
app.use('/api/indicators', routes.indicatorRoute);
app.use('/api/habitlistRecord', routes.habitlistRecordRoute);
app.use('/api/coach', routes.coachRoute);
app.use('/api/coachee', routes.coacheeRoute);
app.use('/api/chat', routes.chatRoute);
app.use('/api/challenges', routes.challengeRoute);
app.use('/api/memberships', routes.membershipRoute);
app.use('/api/unreadNotifications', routes.unreadNotificationRoute);
app.use('/api/healthyTips', routes.healthyTipRoute);
app.use('/api/memberRecords', routes.memberRecordRoute);
app.use('/api/companyCodes', routes.companyCodeRoute);
app.use('/api/categories', routes.categoryRoute);
app.use('/api/notes', routes.noteRoute);
// error handler for not existed api
app.use(function (req, res, next) {
    const err = new Error('No found api');
    err.status = 400;
    next(err);
})

//error handler for all kinds of error
app.use(function (err, req, res, next) {
    if (err.name === 'UserFacingError') {
        res.status(404)
            .json({
                message: err.message
            })
    } else if (res.status === 401) {
        res.status(401)
            .json({
                message: "Unauthorized"
            })

    } else {
        res.status(500)
            .json({
                message: "internal server error"
            })
    }
})

module.exports = app