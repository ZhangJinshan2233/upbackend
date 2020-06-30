'use strict'
const notification = require('../notification');
const challengeService = require('../service/challengeService')();
const Models = require('../models');
const convertCategoryNameToModelName = (categoryName) => {
    return categoryName.toLowerCase()
        .split(' ')
        .map(name => {
            return name.charAt(0).toUpperCase().concat(name.slice(1))
        })
        .join('')
        .concat('JournalPost')
}
/**
 * 
 * @param {firstName:string,lastName:string,_id:string} author 
 * @param {model name:string} authorModel 
 * @param {_id:string} recipient 
 * @param {model name:string} recipientModel 
 * @param {content:string} notificationContent 
 */
const snedPostNotification = async (author, authorModel, recipient, recipientModel, notificationContent) => {
    await notification.sendGeneralNotification(author.firstName + author.lastName, recipient._id, notificationContent)
    await Models.UnreadNotification.create({
        type: "post",
        author: author._id,
        authorModel,
        recipient: recipient._id,
        recipientModel
    })
}
/**
 * create new challenge record
 * @param {*} req 
 * @param {*} res 
 */
const createChallenge = async (req, res) => {
    let {
        _id: _coachee
    } = req.user
    let {
        challengeCategoryId: _challengeCategory,
        startDate,
        endDate
    } = req.body

    let activeChallenge = await challengeService
        .createChallenge(_coachee, _challengeCategory, startDate, endDate)
    if (!activeChallenge) throw new Error('internal error')
    res.status(201).json({
        activeChallenge
    })

}

/**
 * get active chanllenges of all challenges
 * @param {*} req 
 * @param {*} res 
 */
const getActiveChallenges = async (req, res) => {
    let _coachee = ""
    let {
        _id,
        userType
    } = req.user;
    if (userType.includes('Coachee')) {
        _coachee = _id
    } else {
        _coachee = req.query.coacheeId
    }
    let activeChallenges = [];

    activeChallenges = await challengeService.getActiveChallenges(_coachee)
    res.status(200).json({
        activeChallenges
    })
}
/**
 * get nonactive challenges
 * @param {*} req 
 * @param {*} res 
 */
const getNonactiveChallenges = async (req, res) => {
    let {
        _id: coacheeId,
        userType
    } = req.user
    let nonactiveChallenges = [];
    if (userType === "Coachee") {
        nonactiveChallenges = await challengeService
            .getNonactiveChallengesByCoachee(coacheeId, req.query.challengeCategoryId)
    } else {
        nonactiveChallenges = await challengeService
            .getNonactiveChallengesByCoach(req.query.coacheeId)
    }
    res.status(200).json({
        nonactiveChallenges
    })
}
/**
 * get posts pagination
 * @param {*} req 
 * @param {*} res 
 */
const getPostsByPagination = async (req, res) => {
    let {
        challengeId
    } = req.params;
    let skipNum = parseInt(req.query.skipNum);
    let postModel = convertCategoryNameToModelName(req.query.challengeCategoryName)

    let journalPosts = await challengeService
        .getPostsByPagination(challengeId, skipNum, postModel);
    res.status(200).json({
        journalPosts
    })
}
/**
 * create new post
 * @param {*} req 
 * @param {*} res 
 */
const createNewPost = async (req, res) => {
    let postModel = convertCategoryNameToModelName(req.query.challengeCategoryName)
    let {
        _id
    } = req.user
    let coachee = await Models.Coachee.findById(_id)
        .select("_coach firstName lastName")
    let {
        _coach: recipient,
        ...author
    } = coachee
    let authorModel = "Coachee";
    let recipientModel = "Coach";
    let notificationContent = "new post"
    let newPost = await challengeService
        .createNewPost(req.params.challengeId, req.body, postModel);
    console.log(newPost.createDate)
    res.status(200).json({
        newPost
    })
    await snedPostNotification(author, authorModel, recipient, recipientModel, notificationContent)
}
/**
 * rate post
 * @param {*} req 
 * @param {*} res 
 */
const ratePost = async (req, res) => {
    let {
        rating
    } = req.body
    let {
        postId
    } = req.params;
    let postModel = convertCategoryNameToModelName(req.query.challengeCategoryName)
    await challengeService.ratePost(postId, rating, postModel)
    res.status(200).json({
        message: "rating successfully"
    })
}
/**
 * get comments by post id
 * @param {*} req 
 * @param {*} res 
 */
const getCommentsByPostId = async (req, res) => {
    let {
        postId
    } = req.params;
    let postModel = convertCategoryNameToModelName(req.query.challengeCategoryName)
    let comments = []
    comments = await challengeService.getComments(postId, postModel)
    res.status(200).json({
        comments
    })
}

/**
 * create new comment 
 * @params {req.params}
 *          {req.body}
 * @returns string
 */
const creatNewComment = async (req, res) => {
    let {
        content
    } = req.body
    let {
        postId
    } = req.params
    let postModel = convertCategoryNameToModelName(req.query.challengeCategoryName)
    let comment = await challengeService
        .createComment(content, postId, req.user, postModel)

    return res.status(200).json({
        comment
    })
}

module.exports = {
    createChallenge,
    getActiveChallenges,
    getNonactiveChallenges,
    getPostsByPagination,
    createNewPost,
    ratePost,
    getCommentsByPostId,
    creatNewComment
}