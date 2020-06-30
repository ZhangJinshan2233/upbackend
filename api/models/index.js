'use strict'
const mongoose = require('mongoose');
const config = require('../config');
const connection = mongoose.connection;
const Coachee = require('./coachee');
const {
    Coach,
    CommonCoach,
    AdminCoach
} = require('./coach');
const HabitCategory = require('./habitCategory');
const Habit = require('./habit');
const HabitlistRecord = require('./habitlistRecord');
const Indicator = require('./indicator');
const IndicatorRecord = require('./indicatorRecord');
const ChallengeCategory = require('./challengeCategory');
const Challenge = require('./challenge');
const ChatRoom = require('./chatRoom');
const Message = require('./message')
const FoodDetectiveJournalPost = require('./foodDetectiveJournalPost');
const SlumberTimeJournalPost = require('./slumberTimeJournalPost')
const UnreadNotification = require('./unreadNotification');
const MembershipCategory = require('./membershipCategory');
const Membership = require('./membership');
const HealthyTip = require('./healthyTip');
const MemberRecord = require('./memberRcord');
const CompanyCode = require('./companyCode');
const AppCategory = require('./appCategory')
const Category = require('./category');
const Note = require('./note');
const SpecialityCategory = require('./specialityCategory')
//fix deprecation warnings
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(config.dbUrl, {
    socketTimeoutMS: 3000000,
    keepAlive: 3000000,
    useNewUrlParser: true,
    // autoIndex: false
})

connection.on('open', function () {
    console.log('MongoDB database connection established successfully!');
});

connection.on('error', function (err) {
    console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
    process.exit();
})

module.exports = {
    Coachee,
    Coach,
    AppCategory,
    Category,
    CommonCoach,
    AdminCoach,
    HabitCategory,
    Habit,
    HabitlistRecord,
    Indicator,
    IndicatorRecord,
    ChallengeCategory,
    Challenge,
    FoodDetectiveJournalPost,
    ChatRoom,
    Message,
    UnreadNotification,
    MembershipCategory,
    Membership,
    HealthyTip,
    MemberRecord,
    CompanyCode,
    Note,
    SpecialityCategory,
    SlumberTimeJournalPost
}