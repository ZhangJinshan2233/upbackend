const Service = require('../Service');
const Models = require('../../models');
const safeAwait = require('safe-await');
const emailService = require('../emailService')
const {
    errorHandler
} = require('../../middlewares')
const {
    Types
} = require('mongoose');
class ScheduledProgrammeService extends Service {
    constructor(modelName, uploadOptions) {
        super(modelName, uploadOptions)
        this.modelName = modelName;
    }

    /**
     * get all documents based on different conditions
     * @param {*} queryParams 
     */
    getAllDocuments = (queryParams, companyCode) => {
        let {
            startDate,
            endDate,
            pageNumber,
            pageSize,
            sortOrder
        } = queryParams
        let numSort = sortOrder == 'asc' ? 1 : -1
        pageSize = parseInt(pageSize) ? parseInt(pageSize) : 20
        let filter = {}
        if (startDate && endDate) {
            filter = {
                $and: [{
                        company: Types.ObjectId(companyCode)
                    }, {
                        isObsolete: false
                    },
                    {
                        startDate: {
                            $gte: new Date(startDate),
                            $lt: new Date(endDate)
                        }
                    }
                ]
            }
        } else if (startDate && !endDate) {
            filter = {
                $and: [{
                        company: Types.ObjectId(companyCode)
                    }, {
                        isObsolete: false
                    },
                    {
                        startDate: {
                            $gte: new Date(startDate)
                        }
                    }
                ]
            }
        } else if (startDate && !endDate) {
            filter = {
                $and: [{
                        company: Types.ObjectId(companyCode)
                    }, {
                        isObsolete: false
                    },
                    {
                        startDate: {
                            $lt: new Date(endDate)
                        }
                    }
                ]
            }
        } else {
            filter = {
                $and: [{
                    company: Types.ObjectId(companyCode)
                }, {
                    isObsolete: false
                }]
            }
        }
        pageNumber = parseInt(pageNumber) || 0;
        return Models[this.modelName]
            .find(filter)
            .sort({
                'startDate': numSort
            })
            .skip(pageSize * pageNumber)
            .limit(pageSize)
    };

    userGetProgrammes = async (queryParams, userId) => {
        let skipNum = parseInt(queryParams.skipNum) || 0;
        let pageSize = parseInt(queryParams.pageSize) || 10
        let user = await Models['Coachee'].findById(userId);
        let query = {}
        if (user.membershipExpireAt < new Date()) {
            query = {
                $and: [{
                        company: Types.ObjectId(user.group)
                    }, {
                        isObsolete: false
                    },
                    {
                        startDate: {
                            $gte: new Date()
                        }
                    },
                    {
                        isFree: true
                    }
                ]
            }
        } else {
            query = {
                $and: [{
                        company: Types.ObjectId(user.group)
                    }, {
                        isObsolete: false
                    },
                    {
                        startDate: {
                            $gte: new Date()
                        }
                    }
                ]
            }
        }

        return Models[this.modelName]
            .find(query)
            .select('name registeredUsers capacity startDate')
            .sort({
                startDate: 1
            })
            .populate({
                path: 'category'
            })
            .skip(skipNum)
            .limit(pageSize)
    }


    userGetProgrammeById = async (scheduledProgrammeId, userId) => {
        return Models[this.modelName]
            .findById(scheduledProgrammeId)
            .select('name registeredUsers isOnline personInCharge password endDate capacity startDate description trainer  venueOrLink')
            .populate({
                path: 'category'
            })
    }
    /**
     * get total number of documents
     */
    getTotalNumbersOfDocuments = (companyCode) => {
        return Models[this.modelName].countDocuments({
            $and: [{
                company: Types.ObjectId(companyCode)
            }, {
                isObsolete: false
            }]
        })
    }

    /**
     * send reminder emails
     * @param {*} registeredUsers 
     */
    sendMultipleReminderEmails = async (programme) => {
        let findUserPromises = []
        let {
            registeredUsers
        } = programme
        if (registeredUsers.length <= 0) {
            return Promise.resolve('no registered user')
        } else {
            // send emails
            registeredUsers.forEach(userId => {
                let promise = Models['Coachee'].findById(userId)
                findUserPromises.push(promise)
            });
            let users = await Promise.all(findUserPromises);
            return emailService.sendMultipleRemindersEmails(users, programme)
        }
    }

    /**
     * send recruit emails
     * @param {*} companyCodeId 
     * @param {*} isFree 
     * @param {*} registeredUsers 
     * companyCodeId, isFree, registeredUsers
     */
    sendMultipleRecruitEmails = async (programme) => {
        let {
            isFree,
            company,
            registeredUsers
        } = programme
       
        let sendEmailUsers = [];
        let totalUsers = []
        let err
        if (isFree) {
            [err, totalUsers] = await safeAwait(
                Models['Coachee']
                .find({
                    group: company
                })
            )
        } else {
            [err, totalUsers] = await safeAwait(
                Models['Coachee']
                .find({
                    $and: [{
                            group: company
                        },
                        {
                            membershipExpireAt: {
                                $gte: new Date()
                            }
                        }
                    ]
                })
            )
        }
        if (!totalUsers.length || err) throw new errorHandler.UserFacingError('please add users')
        if (registeredUsers.length > 0) {
            sendEmailUsers = totalUsers.filter(user => {
                return !registeredUsers.includes(user._id.toString())
            })

        } else {
            sendEmailUsers = totalUsers
        }
        if (sendEmailUsers.length > 0) {
            return emailService.sendMultipleRecuritEmails(sendEmailUsers, programme)
        }
    }

    batchUploadProgrammes = async (corporateAdminId, programmes) => {
        if (!programmes.length)
            throw new errorHandler.UserFacingError('please add programmes')
        /**
         * insert new programmes
         */
        let admin = await Models['CorporateAdmin']
            .findById(corporateAdminId)
            .select('company membershipExpireAt')

        let insertProgrammesPromises = []
        if (new Date(admin.membershipExpireAt) < new Date()) { // if admin is not a member
            throw new errorHandler.UserFacingError('please upgrade your membership')
        } else { //admin have membership
            for (let i = 0; i < programmes.length; i++) {
                let programmeWithCompanyCode = {
                    ...programmes[i],
                    company: admin.company
                }
                console.log(programmeWithCompanyCode)
                let insertProgrammePromise = Models['ScheduledProgramme']
                    .create(programmeWithCompanyCode)
                insertProgrammesPromises.push(insertProgrammePromise)
            }
            return Promise.all(insertProgrammesPromises)
        }
    }

    /**
     * 
     * @param {*} content 
     * @param {*} rating 
     * @param {*} scheduleProgrammeId 
     * @param {*} user 
     */
    createComment = async (comment, scheduleProgrammeId, userId) => {

        let existingComment = await this.getCommentByUserId(scheduleProgrammeId, userId)
        if (existingComment) {
            return this.updateComment(scheduleProgrammeId, userId, comment)
        } else {
            let {
                content,
                rating
            } = comment
            let newComment = {
                content,
                rating,
                user: userId,
                createDate: new Date()
            }
            return Models[this.modelName]
                .findByIdAndUpdate(Types.ObjectId(scheduleProgrammeId), {
                    $push: {
                        comments: newComment
                    }
                })
        }

    };

    /**
     * 
     * @param {*} scheduledProgrammeId 
     * @param {*} userId 
     */
    getCommentByUserId = async (scheduledProgrammeId, userId) => {
        let userComment
        let programme=await Models[this.modelName]
            .findById(scheduledProgrammeId)
            .select('comments')
        if(programme.comments.length>0){
            userComment=programme.comments
            .find(comment=>{
                console.log(comment.user===userId)
                return comment.user.toString()===userId
            })
        }else{
            userComment=null
        }
        return userComment
    }

    updateComment = async (scheduledProgrammeId, userId, changedProperties) => {

        let isHaveContent = Object.keys(changedProperties).includes('content');
        let isHaveRating = Object.keys(changedProperties).includes('rating');
        let query = {
            $and: [{
                _id: Types.ObjectId(scheduledProgrammeId)
            }, {
                'comments.user': {
                    $eq: userId
                }
            }]
        };

        let updateDocument = {};
        if (isHaveContent && !isHaveRating) {
            updateDocument = {
                $set: {
                    'comments.$.content': changedProperties.content
                }
            }
        } else if (isHaveRating && !isHaveContent) {
            updateDocument = {
                $set: {
                    'comments.$.rating': changedProperties.rating
                }
            }
        } else {
            updateDocument = {
                $set: {
                    'comments.$.content': changedProperties.content,
                    'comments.$.rating': changedProperties.rating
                }
            }
        }

        return Models[this.modelName].findOneAndUpdate(query, updateDocument)
    }
}
const scheduledProgrammeService = new ScheduledProgrammeService("ScheduledProgramme");
module.exports = scheduledProgrammeService