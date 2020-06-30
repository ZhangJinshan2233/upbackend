'use strict'
const Models = require('../../models');
const {
    Types
} = require('mongoose');

const _h = require('../../helpers');

const ratingDescription = require('./ratingDescription')();

const caculateAverageRating = (nonactiveChallenges) => {
    return nonactiveChallenges.reduce((acc, current) => {
        let totalRating = 0;
        let averageRating = 0;
        let ratedItems = 0;
        let description = ""
        let postModel = current._challengeCategory
            .name
            .toLowerCase()
            .trim()
            .split(' ')
            .join('');

        for (let i = 0; i < current.posts.length; i++) {
            if (current.posts[i]._post.rating > 0) {
                totalRating += current.posts[i]._post.rating;
                ratedItems += 1
            }
        }
        if (ratedItems > 0) {
            averageRating = (totalRating / ratedItems).toFixed(1)
            if (Object.keys(ratingDescription).includes(postModel)) {
                description = ratingDescription[postModel](averageRating)
            }
        }
        let nonactiveChallenge = {
            categoryName: current._challengeCategory.name,
            averageRating,
            ratingDescription: description,
            ...JSON.parse(JSON.stringify(current))
        }
        return [nonactiveChallenge, ...acc]
    }, [])
}
module.exports = () => {
    const challengeService = {};
    /**
     * 
     * @param {*} _coachee 
     * @param {*} _challengeCategory 
     * @param {*} startDate 
     * @param {*} endDate 
     */
    challengeService.createChallenge = async (_coachee, _challengeCategory, startDate, endDate) => {
        let newChallengePromise = Models.Challenge.create({
            _coachee,
            _challengeCategory,
            startDate: new Date(startDate),
            endDate: new Date(endDate)
        })

        let challengeCategoryPromise = Models.ChallengeCategory
            .findById(_challengeCategory)

        let [newChallenge, challengeCategory] = await Promise.all([newChallengePromise, challengeCategoryPromise])
        let image = `data:${challengeCategory.imgType};base64,` + Buffer.from(challengeCategory.imgData).toString('base64');

        let activeChallenge = {
            categoryName: challengeCategory.name,
            categoryImage: image,
            ...JSON.parse(JSON.stringify(newChallenge))
        }

        return activeChallenge
    };
    /**
     * 
     * @param {*} coacheeId 
     */
    challengeService.getActiveChallenges = async (coacheeId) => {
        let activeChallenges = [];
        let challenges = await Models.Challenge.find({
                $and: [{
                        _coachee: coacheeId
                    },
                    {
                        endDate: {
                            $gte: new Date()
                        }
                    },
                    {
                        isObsolete: false
                    }
                ]
            }).populate({
                path: '_challengeCategory',
                select: 'name imgType imgData'
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
                if (current.posts.length > 0) {
                    for (let i = 0; i < current.posts.length; i++) {
                        if (current.posts[i]._post) {
                            if (current.posts[i]._post.rating > 0) {
                                totalRating += current.posts[i]._post.rating;
                                ratedItems += 1
                            }
                        }

                    }
                    averageRating = (totalRating / ratedItems).toFixed(1)
                }
                let {
                    _challengeCategory,
                    ...restProperiesOfCurrent
                } = JSON.parse(JSON.stringify(current))
                let activeChallenge = {
                    categoryName: current._challengeCategory.name,
                    categoryImage: image,
                    averageRating,
                    _challengeCategory: _challengeCategory._id,
                    ...restProperiesOfCurrent
                }
                return [activeChallenge, ...acc]
            }, [])
        }
        return activeChallenges
    }

    /**
     * 
     * @param challengeCategoryId:string
     */
    challengeService.getNonactiveChallengesByCoachee = async (coacheeId, challengeCategoryId) => {
        let challenges = [];
        challenges = await Models.Challenge.find({
                $and: [{
                        _coachee: coacheeId
                    }, {
                        _challengeCategory: challengeCategoryId
                    },
                    {
                        endDate: {
                            $lte: new Date()
                        }
                    },
                    {
                        isObsolete: false
                    }
                ]
            })
            .populate({
                path: '_challengeCategory',
                select: 'name'
            })
            .populate({
                path: 'posts._post',
                select: 'rating'
            })

        let nonactiveChallenges = caculateAverageRating(challenges)

        return nonactiveChallenges

    }

    /**
     * 
     * @param challengeCategoryId:string
     */
    challengeService.getNonactiveChallengesByCoach = async (coacheeId) => {
        let challenges = [];
        challenges = await Models.Challenge.find({
                $and: [{
                        _coachee: coacheeId
                    },
                    {
                        endDate: {
                            $lte: new Date()
                        }
                    },
                    {
                        isObsolete: false
                    }
                ]
            }).populate({
                path: '_challengeCategory',
                select: 'name'
            })
            .populate({
                path: 'posts._post',
                select: 'rating'
            })

        let nonactiveChallenges = caculateAverageRating(challenges)
        return nonactiveChallenges
    }
    /**
     * 
     * @param {*} challengeId 
     * @param {*} skipNumber 
     */
    challengeService.getPostsByPagination = async (challengeId, skipNum, postModel) => {
        const recordSize = 3;
        const collectionName = `${postModel.toLowerCase()}s`;
        let journal = [];
        let journalPosts = [];
        journal = await Models.Challenge.aggregate([{
                $match: {
                    _id: Types.ObjectId(challengeId)
                }
            },
            {
                $unwind: {
                    path: "$posts"
                }
            },
            {
                $lookup: {
                    from: collectionName,
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

        if (journal.length > 0) {
            journalPosts = journal.reduce((acc, current) => {
                let post = {
                    ...JSON.parse(JSON.stringify(current.post))
                }
                return [...acc, post]
            }, [])
        }
        return journalPosts
    }
    /**
     * 
     * @param {*} challengeId
     * @param {*} journalPost 
     */
    challengeService.createNewPost = async (challengeId, journalPost, postModel) => {
        let imgDataBase64Post = {}
        let post = {};
        let hasImage = false
        if (Object.keys(journalPost).includes('imgData')) {
            hasImage = true;
            let {
                imgData,
                ...restPropertiesofJournalPost
            } = journalPost
            post = {
                imgData: _h.convertBase64ToBuffer(imgData),
                ...restPropertiesofJournalPost
            }
        } else {
            if (Object.keys(journalPost).includes('fallAsleepTime')) {
                let {
                    fallAsleepTime,
                    ...restPropertiesofJournalPost
                } = journalPost
                post = {
                    fallAsleepTime,
                    createDate: fallAsleepTime,
                    ...restPropertiesofJournalPost
                }
            } else {
                post = journalPost
            }

        }
        //create new post
        console.log(Models[postModel])
        let newCreatedPost = await Models[postModel].create(post);
        if (!newCreatedPost) throw new Error('can not create new post')
        //update post id of challenge
        await Models.Challenge.findByIdAndUpdate({
            _id: challengeId
        }, {
            $push: {
                posts: {
                    _post: newCreatedPost._id,
                    postModel: postModel
                }
            }
        })
        //return 
        if (hasImage) {
            let {
                imgData,
                ...restPropertiesOfNewPost
            } = JSON.parse(JSON.stringify(newCreatedPost))
            imgDataBase64Post = {
                imgData: _h.convertBufferToBase64(imgData),
                ...restPropertiesOfNewPost
            }
        } else {
            imgDataBase64Post = JSON.parse(JSON.stringify(newCreatedPost))
        }
        return imgDataBase64Post
    };
    /**
     * 
     * @param {*} postId 
     * @param {*} rating 
     * @param {*} modelName 
     */
    challengeService.ratePost = async (postId, rating, postModel) => {
        let post = await Models[postModel].findByIdAndUpdate((postId), {
            $set: {
                rating
            }
        })
    }
    /**
     * 
     * @param {*} postId 
     * @param {*} modelName 
     */
    challengeService.getComments = async (postId, postModel) => {
        let comments = []
        let post = await Models[postModel]
            .findById({
                _id: postId
            })
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
        return comments
    };

    /**
     * 
     * @param {*} content 
     * @param {*} postId 
     * @param {_id,userType} user 
     */
    challengeService.createComment = async (content, postId, user, postModel) => {
        let _coach = null;
        let _coachee = null;
        let isCoach = false;
        let post = {}
        let {
            userType,
            _id
        } = user
        if (userType === "Coachee") {
            _coachee = _id;
        }
        if (userType == "CommonCoach" || userType == "AdminCoach") {
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
            await Models[postModel].findByIdAndUpdate(Types.ObjectId(postId), {
                $push: {
                    comments: newComment
                }
            })
            post = await Models[postModel]
                .findById(Types.ObjectId(postId))
                .select({
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

            return comment

        } catch (error) {
            throw error
        }
    };
    return challengeService
}