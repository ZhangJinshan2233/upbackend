'use strict'
const mongoose = require('mongoose');
const config = require('../config');
const connection = mongoose.connection;
const {
    once
} = require('events')
const Coachee = require('./coachee');
const {
    Coach,
    CommonCoach,
    AdminCoach,
    PartnerCoach
} = require('./coach');
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
const MemberTransaction = require('./memberTransaction');
const MemberRecord = require('./memberRcord');
const CompanyCode = require('./companyCode');
const AppCategory = require('./appCategory')
const Category = require('./category');
const Note = require('./note');
const {
    Video,
    StudioVideo,
    TipVideo
} = require('./video')
const {
    MediaSubcategory,
    StudioVideoMainCategory,
    TipVideoMainCategory,
    LearnArticleMainCategory
} = require('./mediaCategory');
const GcpMedia = require('./GcpMedia')
const SpecialityCategory = require('./specialityCategory');
const ProgrammeRecord=require('./programmeRecord')
const ScheduledProgramme=require('./scheduledProgramme')
const ScheduledProgrammeCategory=require('./scheduledProgrammeCategory')
const GoalCategory = require('./goalCategory');
const {
    Article,
    LearnArticle
} = require('./article');
const CorporateAdmin=require('./corporateAdmin')
//fix deprecation warnings
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);
mongoose.set("useUnifiedTopology", true);
async function initialize() {
    mongoose.connect(config.dbUrl, {
        socketTimeoutMS: 3000000,
        keepAlive: 3000000,
        useNewUrlParser: true,
        // autoIndex: false
    })
    await once(connection, 'open')
}

initialize()
    .then(() => {
        console.log('MongoDB database connection established successfully!');
    })
    .catch((err) => {
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
    Indicator,
    IndicatorRecord,
    ChallengeCategory,
    Challenge,
    FoodDetectiveJournalPost,
    ChatRoom,
    Message,
    UnreadNotification,
    MembershipCategory,
    MemberTransaction,
    MemberRecord,
    CompanyCode,
    Note,
    SpecialityCategory,
    SlumberTimeJournalPost,
    MediaSubcategory,
    StudioVideoMainCategory,
    Video,
    StudioVideo,
    TipVideo,
    GcpMedia,
    ScheduledProgrammeCategory,
    ScheduledProgramme,
    GoalCategory,
    TipVideoMainCategory,
    LearnArticleMainCategory,
    Article,
    LearnArticle,
    PartnerCoach,
    CorporateAdmin,
    ProgrammeRecord
}