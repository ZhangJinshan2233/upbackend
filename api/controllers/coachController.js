const {
    Coach,
    Coachee,
    UnreadNotification,
    Indicator,
    IndicatorRecord,
    MemberRecord
} = require('../models')
const Models = require('../models')

const {
    differenceInCalendarDays
} = require('date-fns')
const {
    deleteFile,
    uploadPhoto,
    getGCPName
} = require('../service/mediaHelper');

const {
    GCP
} = require('../config')
const {
    Types
} = require('mongoose');
const {
    UserFacingError
} = require('../middlewares').errorHandler

const uploadOptions={
    bucketName:GCP.mediaBucket,
    imageDestination:'profileimages'
}
/**
 * @function signup.
 * @public
 * @param {req.body}:email,password,firstName,lastName.
 * @returns string.
 */
let signup = async (req, res) => {
    let {
        email,
        firstName,
        userType,
        ...remainingProperties
    } = req.body
    if (typeof (userType) == 'undefined')
        throw new UserFacingError('You need to input required information')
    if (!email)
        throw new UserFacingError('You need to input required information')

    if (typeof (req.files) !== "undefined" && req.files['poster'][0]) {
        let posterFile = req.files['poster'][0];
        const newPoster = await uploadPhoto(uploadOptions, posterFile);
        Object.assign(remainingProperties, newPoster)
    }
    try {
        let coacheePromise = Coachee.findOne({
            email: email
        });

        let coachPromise = Coach.findOne({
            email: email
        });

        let coachAndCoachee = await Promise.all([coachPromise, coacheePromise])
        coach = coachAndCoachee[0];
        coachee = coachAndCoachee[1];

        if (coach || coachee) throw new UserFacingError('email already existed');
        let newCoach = await Models[userType].create({
            email,
            firstName,
            password:'Flourish12345',
            ...remainingProperties
        })

        return res.status(200).json({
            newCoach
        })

    } catch (err) {
        throw Error(err)
    }
}
/**
 * get coachees pagination
 * @param {*} req 
 * @param {*} res 
 */
let get_coachees_pagination = async (req, res) => {
    let {
        _id
    } = req.user;
    let skipNum = parseInt(req.query.skipNum) || 0;
    let recordSize = 10;
    let coachees = []
    let _indicator = null
    let _indicatorPromise = Indicator.findOne({
        name: "Weight"
    }).select('_id')
    .exec()
    coacheesPromise = Coachee.find({
            _coach: _id
        })
        .sort({
            createdAt: 1
        })
        .skip(skipNum)
        .limit(recordSize)
        .exec()
    let convertedCoachees = []
    let indicatorObjctAndCoachees = await Promise.all([_indicatorPromise, coacheesPromise]);
    _indicator = indicatorObjctAndCoachees[0]._id;
    coachees = indicatorObjctAndCoachees[1];
    if (coachees.length > 0) {
        for (let coachee of coachees) {
            let unreadMessages = [];
            let unreadMessageItems = 0;
            let unreadMessageEarliestDate = new Date();
            let changedWeight = 0;
            let remainingDaysOfMembership = 0
            let latestWeightRecord = 0
            //get unreadNotifications
            let unreadMessagesPromise = UnreadNotification.find({
                $and: [{
                    type: "message"
                }, {
                    author: coachee._id
                }, {
                    recipient: _id
                }]
            }).sort({
                createdAt: -1
            })

            let latestWeightRecordPromise = IndicatorRecord.findOne({
                    $and: [{
                            _coachee: coachee._id
                        },
                        {
                            isObsolete: false
                        },
                        {
                            _indicator
                        }
                    ]
                })
                .sort({
                    createDate: -1
                })

            let combineData = await Promise.all([unreadMessagesPromise, latestWeightRecordPromise]);
            unreadMessages = combineData[0];
            latestWeightRecord = combineData[2];

            if (unreadMessages.length > 0) {
                unreadMessageItems = unreadMessages.length;
                unreadMessageEarliestDate = unreadMessages[0].createdAt
            }

            if (latestWeightRecord) {
                changedWeight = (latestWeightRecord.value - coachee.weight).toFixed(1)
            }
            if (coachee.membershipExpireAt>new Date()) { //judge coachee is member or not
                //get remaining days of member 
                remainingDaysOfMembership = differenceInCalendarDays(coachee.membershipExpireAt, new Date())
            } else {
                remainingDaysOfMembership = 0
            }
            let convertedCoachee = {
                _id: coachee._id,
                email: coachee.email,
                name: coachee.firstName + coachee.lastName,
                posterUrl: coachee.posterUrl,
                remainingDaysOfMembership,
                changedWeight,
                unreadMessageItems,
                unreadMessageEarliestDate
            }
            convertedCoachees.push(convertedCoachee)

        }
    }

    res.status(200).json({
        coachees: convertedCoachees
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_coachee = async (req, res) => {
    let {
        coacheeId: _id
    } = req.params
    let coachee = await Coachee
        .findById(_id)
        .populate({
            path: 'goal',
            select: 'name'
        })
    if (!coachee) throw Error('can not find coachee')
    let currentUser = JSON.parse(JSON.stringify(coachee))
    res.status(200).json({
        coachee: currentUser
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let getCoachById = async (req, res) => {
    let coach = {}
    let {
        coachId: _id
    } = req.params
    coach = await Coach.findById(_id)
        .populate({
            path: 'specialities._speciality',
            select: 'name'
        })
    if (!coach) throw Error('can not find')
    //prevent theRestOfPropertiesCoach passing parent class of coach object
    let currentCoach = JSON.parse(JSON.stringify(coach))
    res.status(200).json({
        coach: currentCoach
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_enrolled_and_expired_members = async (req, res) => {

    let {
        _id
    } = req.user

    let enrolledCoachees = [];
    let expiredNumber = 0;
    let promises = []
    let membersNumber = 0
    enrolledCoachees = await Coachee.find({
        _coach: _id
    })
    if (enrolledCoachees.length >= 1) {
        for (let i = 0; i < enrolledCoachees.length; i++) {
            let checkMembershipPromise = MemberRecord.findOne({
                _coachee: enrolledCoachees[i]._id
            })
            promises.push(checkMembershipPromise)
        }
        members = await Promise.all(promises)
        membersNumber = members.filter((item) => {
            return item
        })
        expiredNumber = enrolledCoachees.length - membersNumber.length

    } else {
        expiredNumber = enrolledCoachees.length
    }


    res.status(200).json({
        enrolledNumber: enrolledCoachees.length,
        expiredNumber
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_coaches_pagination = async (req, res) => {
    let queryParams = req.query
    let {
        sortOrder,
        filter
    } = queryParams;

    let numSort = sortOrder == 'desc' ? -1 : 1
    let pageSize = parseInt(queryParams.pageSize)
    let pageNumber = parseInt(queryParams.pageNumber) || 0
    let coaches = [];
    try {
        coaches = await Coach
            .find({
                $and: [{
                        userType: {
                            $nin: ['AdminCoach']
                        }
                    },
                    {
                        email: {
                            $regex: filter
                        }
                    }
                ]
            })
            .sort({
                'createdAt': numSort
            })
            .skip(pageSize * pageNumber)
            .limit(pageSize)
            .select('email firstName lastName status createdAt')
    } catch (error) {
        throw new Error('get coachees error')
    }
    res.status(200).json({
        coaches
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_coach_total_numbers = async (req, res) => {

    let numCoaches = 0
    try {
        let Coaches = await Coach.find({
            userType: {
                $nin: ['AdminCoach']
            }
        })
        numCoaches = Coaches.length
    } catch (error) {
        throw error
    }

    res.status(200).json({
        numCoaches
    })

}
/**
 * coach admin update common coach
 * @param {*} req 
 * @param {*} res 
 */
let updateCoach = async (req, res) => {
    let {
        coachId: _id
    } = req.params;
    let changedProperties = {};
    const {
        userType,
        ...otherProperties
    } = req.body;
    let coach = await Models[userType].findById(_id);
    if (!coach) throw new Error('can not find')
    const posterFile = req.files['poster'] ? req.files['poster'][0] : null;
    if (posterFile !== null) {
        const newPoster = await uploadPhoto(uploadOptions, posterFile);
        if (typeof (coach.posterUrl) !== 'undefined') {
            await deleteFile(uploadOptions.bucketName, getGCPName(coach.posterUrl));
        }
        changedProperties = {
            ...newPoster,
            ...otherProperties
        }
    } else {
        changedProperties = otherProperties
    }
    await Models[userType].findByIdAndUpdate(
        _id, {
            $set: {
                ...changedProperties
            }
        }
    )
    res.status(200).json({
        message: "updated successfully"
    })
}

/**
 * get kinds of coaches
 */
let getKinds = async (req, res) => {
    let userTypes = Object.keys(Models.Coach.discriminators).filter(userType => {
        if (!['AdminCoach'].includes(userType)) {
            return true
        }
    })
    res.status(200).json({
        userTypes: userTypes
    })
}
module.exports = {
    signup,
    get_coachees_pagination,
    get_coachee,
    getCoachById,
    get_enrolled_and_expired_members,
    get_coaches_pagination,
    get_coach_total_numbers,
    updateCoach,
    getKinds
}