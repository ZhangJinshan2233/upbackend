'use strict'
const {
    unreadNotificationController
} = require('./unreadNotificationController');
const _h = require('../helpers')
const notification = require('../notification');
const {
    compareDesc
} = require('date-fns')
const {
    Challenge,
    ChallengeCategory,
    FoodJournalPost,
    UnreadNotification,
    Coachee
} = require('../models');
const {
    Types
} = require('mongoose');
/**
 * create new challenge record
 * @param {_challenge,value,createDate} req 
 * @param {*} res 
 */
let create_challenge = async (req, res) => {
    let {
        _id: _coachee,
        userType
    } = req.user

    let coachee = await Coachee.findById(_coachee).select('membershipEndDate')

    if (userType === "Coachee") {
        if (compareDesc(coachee.membershipEndDate, new Date()) === 1) {
            throw Error('only member can join')
        }
    }

    let {
        challengeCategoryId: _challengeCategory,
        startDate,
        endDate
    } = req.body

    let newChallenge = await Challenge.create({
        _coachee,
        _challengeCategory,
        startDate: new Date(startDate),
        endDate: new Date(endDate)

    })
    let challengeCategory = await ChallengeCategory.findById(_challengeCategory)

    let image = `data:${challengeCategory.imgType};base64,` + Buffer.from(challengeCategory.imgData).toString('base64');

    let activeChallenge = {
        categoryName: challengeCategory.name,
        categoryImage: image,
        ...JSON.parse(JSON.stringify(newChallenge))
    }
    res.status(201).json({
        activeChallenge
    })

}

/**
 * get latest record of all challenges
 * @param {*} req 
 * @param {*} res 
 */
let get_active_challenges = async (req, res) => {

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
    let currentDate = new Date();
    let activeChallenges = [];
    let challenges = await Challenge.find({
            $and: [{
                    _coachee
                },
                {
                    endDate: {
                        $gte: currentDate
                    }
                },
                {
                    isObsolete: false
                }
            ]
        })
        .populate({
            path: 'posts._post',
            select: 'rating'
        })
    if (challenges.length > 0) {
        activeChallenges = challenges.reduce((acc, current) => {
            let image = `data:${current._challengeCategory.imgType};base64,` + Buffer.from(current._challengeCategory.imgData).toString('base64');
            let totalRating = 0;
            let averageRating = 0;
            let ratedItems = 0;
            for (let i = 0; i < current.posts.length; i++) {
                if (current.posts[i]._post.rating > 0) {
                    totalRating += current.posts[i]._post.rating;
                    ratedItems += 1
                }
            }
            averageRating = (totalRating / ratedItems).toFixed(1)
            let activeChallenge = {
                categoryName: current._challengeCategory.name,
                categoryImage: image,
                averageRating,
                ...JSON.parse(JSON.stringify(current))
            }
            return [activeChallenge, ...acc]
        }, [])
    }
    res.status(200).json({
        activeChallenges
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let create_new_post = async (req, res) => {
    let {
        challengeId: _id
    } = req.params;

    let challenge = await Challenge.findById(_id)
        .select('_coachee')
        .populate({
            path: "_coachee",
            select: "_coach firstName lastName"
        })

    let {
        firstName,
        lastName,
        _id: author,
        _coach: recipient,

    } = challenge._coachee
    let authorModel = "Coachee";
    let recipientModel = "Coach";
    let notificationContent = "new post"
    let {
        imgData,
        ...otherProperties
    } = req.body

    let bufferImgData = Buffer.from(imgData, 'base64')
    let newPost = await FoodJournalPost.create({
        imgData: bufferImgData,
        ...otherProperties
    })
    await Challenge.findByIdAndUpdate(
        _id, {
            $push: {
                posts: {
                    _post: newPost._id,
                    postModel: 'FoodJournalPost'
                }
            }
        }
    ).exec()

    notification.send_notification(firstName + lastName, recipient, notificationContent)
    await UnreadNotification.create({
        type: "post",
        author,
        authorModel,
        recipient,
        recipientModel
    })
    let imgDataBase64Post = {
        _id: newPost._id,
        description: newPost.description,
        imgType: newPost.imgType,
        imgData: Buffer.from(newPost.imgData).toString('base64'),
        rating: newPost.rating,
        createDate: newPost.createDate,
        comments: newPost.comments,
        mealCategory: newPost.mealCategory
    }

    res.status(200).json({
        newPost: imgDataBase64Post
    })
}
/**
 * get posts pagination
 * @param {*} req 
 * @param {*} res 
 */
let get_foodjournalposts_pagination_by_challengeId = async (req, res) => {
    let {
        challengeId
    } = req.params;
    let skipNum = parseInt(req.query.skipNum);
    let recordSize = 3;
    let foodJournal = await Challenge.aggregate([{
            $match: {
                _id: Types.ObjectId(challengeId)
            }
        }, {
            $unwind: {
                path: "$posts"
            }
        }, {
            $lookup: {
                from: "foodjournalposts",
                localField: "posts._post",
                foreignField: "_id",
                as: "post"
            }
        },
        {
            $unwind: {
                path: "$post"
            }
        },
        {
            $sort: {
                "post.createDate": -1
            }
        },
        {
            $skip: (skipNum)
        }, {
            $limit: (recordSize)
        }
    ]);
    let foodJournalPosts = foodJournal.reduce((acc, current) => {
        let post = {
            _id: current.post._id,
            description: current.post.description,
            imgType: current.post.imgType,
            imgData: current.post['imgData'],
            rating: current.post.rating,
            comments: current.post.comments,
            mealCategory: current.post.mealCategory,
            createDate: current.post.createDate
        }
        return [...acc, post]
    }, [])
    res.status(200).json({
        foodJournalPosts
    })
}

let get_comments_by_postId = async (req, res) => {
    let {
        postId: _id
    } = req.params;
    let comments = []
    let post = await FoodJournalPost
        .findById(_id)
    if (post.comments.length > 0) {
        comments = post.comments.reduce((acc, current) => {
            let image = null
            let sender = {
                firstName: "",
                lastName: "",
                image: null
            }
            if (current._coach) {
                if (current._coach.imgData !== null) {
                    image = "data:image/jpeg;base64," + Buffer.from(current._coach.imgData).toString('base64');
                }
                sender = {
                    firstName: current._coach.firstName,
                    lastName: current._coach.lastName,
                    image,
                }
            }
            if (current._coachee) {
                if (current._coachee.imgData !== null) {
                    image = "data:image/jpeg;base64," + Buffer.from(current._coachee.imgData).toString('base64');
                }
                sender = {
                    firstName: current._coachee.firstName,
                    lastName: current._coachee.lastName,
                    image
                }
            }
            let comment = {
                isCoach: current.isCoach,
                sender,
                content: current.content,
                createDate: current.createDate
            }
            return [...acc, comment]
        }, [])
    }
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
let create_new_comment = async (req, res) => {
    let _coach = null;
    let _coachee = null;
    let isCoach = false;
    let {
        content
    } = req.body

    let {
        postId
    } = req.params

    let {
        userType,
        _id
    } = req.user
    let post = {}
    if (userType == "Coachee") {
        _coachee = _id;
    }

    if (userType == "Coach" || userType == "AdminCoach") {
        isCoach = true;
        _coach = _id
    }
    let newComment = {
        isCoach: isCoach,
        _coach: _coach,
        _coachee: _coachee,
        content: content,
        createDate: new Date()
    }
    try {
        await FoodJournalPost.findByIdAndUpdate(Types.ObjectId(postId), {
            $push: {
                comments: newComment
            }
        })
        post = await FoodJournalPost.findById(Types.ObjectId(postId)).select({
            comments: {
                "$elemMatch": {
                    createDate: newComment.createDate
                }
            }
        })
        let image = null
        let sender = {
            firstName: "",
            lastName: "",
            image: null
        }
        if (post.comments[0]._coach) {
            if (post.comments[0]._coach.imgData !== null) {
                image = "data:image/jpeg;base64," + Buffer.from(post.comments[0]._coach.imgData).toString('base64');
            }
            sender = {
                firstName: post.comments[0]._coach.firstName,
                lastName: post.comments[0]._coach.lastName,
                image,
            }
        }
        if (post.comments[0]._coachee) {
            if (post.comments[0]._coachee.imgData !== null) {
                image = "data:image/jpeg;base64," + Buffer.from(post.comments[0]._coachee.imgData).toString('base64');
            }
            sender = {
                firstName: post.comments[0]._coachee.firstName,
                lastName: post.comments[0]._coachee.lastName,
                image
            }
        }
        let comment = {
            isCoach: post.comments[0].isCoach,
            sender,
            content: post.comments[0].content,
            createDate: post.comments[0].createDate
        }
        return res.status(200).json({
            comment
        })
    } catch (error) {
        throw error
    }
}

let get_nonactive_challenges = async (req, res) => {
    let {
        _id,
        userType
    } = req.user;
    let _coachee = '';
    let _challengeCategory = ""
    let currentDate = new Date();
    let nonactiveChallenges = [];
    let challenges = []
    if (userType.includes('Coachee')) {
        _coachee = _id
        _challengeCategory = req.query.challengeCategoryId;
        challenges = await Challenge.find({
            $and: [{
                    _coachee
                }, {
                    _challengeCategory
                },
                {
                    endDate: {
                        $lte: currentDate
                    }
                },
                {
                    isObsolete: false
                }
            ]
        }).populate({
            path: 'posts._post',
            select: 'rating'
        })
    } else {
        _coachee = req.query.coacheeId;
        challenges = await Challenge.find({
            $and: [{
                    _coachee
                },
                {
                    endDate: {
                        $lte: currentDate
                    }
                },
                {
                    isObsolete: false
                }
            ]
        }).populate({
            path: 'posts._post',
            select: 'rating'
        })

    }
    nonactiveChallenges = challenges.reduce((acc, current) => {
        let totalRating = 0;
        let averageRating = 0;
        let ratedItems = 0;
        let ratingDescription = ""
        for (let i = 0; i < current.posts.length; i++) {
            if (current.posts[i]._post.rating > 0) {
                totalRating += current.posts[i]._post.rating;
                ratedItems += 1
            }
        }
        if (ratedItems > 0) {
            averageRating = (totalRating / ratedItems).toFixed(1)
            ratingDescription = _h.get_rating_description(averageRating)
        }
        let nonactiveChallenge = {
            categoryName: current._challengeCategory.name,
            averageRating,
            ratingDescription,
            ...JSON.parse(JSON.stringify(current))
        }
        return [nonactiveChallenge, ...acc]
    }, [])
    res.status(200).json({
        nonactiveChallenges
    })
}

let rate_post = async (req, res) => {
    let {
        userType
    } = req.user
    let {
        rating
    } = req.body
    let {
        postId
    } = req.params
    if (userType.includes('Coachee')) throw Error('can not rate post')
    let post=await FoodJournalPost.findByIdAndUpdate((postId), {
        $set: {
            rating
        }
    })

    console.log(post)
    res.status(200).json({
        message:"rating successfully"
    })
}
module.exports = {
    create_challenge,
    get_active_challenges,
    create_new_post,
    get_foodjournalposts_pagination_by_challengeId,
    get_comments_by_postId,
    create_new_comment,
    get_nonactive_challenges,
    rate_post
}