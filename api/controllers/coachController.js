const {
    Coach,
    Coachee,
    CommonCoach,
    AdminCoach,
    UnreadNotification,
    Indicator,
    Habit,
    HabitlistRecord,
    IndicatorRecord,
    MemberRecord
} = require('../models')

const {
    get_week_habitlist,
    convert_time_to_localtime
} = require('../helpers')
const {
    differenceInCalendarDays,
    subDays,
    format,
    getDay,
    isSameDay
} = require('date-fns')
const {
    Types
} = require('mongoose');

/**
 * @function signup.
 * @public
 * @param {req.body}:email,password,firstName,lastName.
 * @returns string.
 */
let signup = async (req, res) => {
    let {
        email,
        ...remainingProperties
    } = req.body
    let userType = req.query.userType || "coach"
    if (!email)
        throw Error('You need to input required information')
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

        if (coach || coachee) throw Error('email already existed');

        let newCoach = {};

        if (userType === "coach") {
            newCoach = await CommonCoach.create({
                email,
                ...remainingProperties
            })
        } else {
            newCoach = await AdminCoach.create({
                email,
                ...remainingProperties
            })
        }


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
    let recordSize = 4;
    let coachees = []
    let _indicator = null
    let _indicatorPromise = Indicator.findOne({
        name: "weight"
    }).select('_id').exec()

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    coacheesPromise = Coachee.find({
            _coach: _id
        })
        .sort({
            createdAt: 1
        })
        .skip(skipNum)
        .limit(recordSize).exec()
    let convertedCoachees = []
    let indicatorObjctAndCoachees = await Promise.all([_indicatorPromise, coacheesPromise]);
    _indicator = indicatorObjctAndCoachees[0]._id;
    coachees = indicatorObjctAndCoachees[1];
    if (coachees.length > 0) {
        for (let coachee of coachees) {
            let unreadMessages = [];
            let unreadPosts = []
            let unreadPostItems = 0
            let unreadMessageItems = 0;
            let unreadMessageEarliestDate = new Date();
            let unreadPostEarliestDate = new Date();
            let changedWeight = 0;
            let remainingDaysOfMembership = 0
            let latestWeightRecord = 0
            let memberRecord = null
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
            let unreadPostsPromise = UnreadNotification.find({
                $and: [{
                    type: "post"
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

            let memberRecordPromise = MemberRecord.findOne({
                _coachee: Types.ObjectId(coachee._id)
            })

            let combineData = await Promise.all([unreadMessagesPromise, unreadPostsPromise, latestWeightRecordPromise, memberRecordPromise]);
            unreadMessages = combineData[0];
            unreadPosts = combineData[1];
            latestWeightRecord = combineData[2];
            memberRecord = combineData[3];

            if (unreadMessages.length > 0) {
                unreadMessageItems = unreadMessages.length;
                unreadMessageEarliestDate = unreadMessages[0].createdAt
            }

            if (unreadPosts.length > 0) {
                unreadPostItems = unreadPosts.length;
                unreadPostEarliestDate = unreadPosts[0].createdAt
            }

            if (latestWeightRecord) {
                changedWeight = latestWeightRecord.value - coachee.weight
            }

            let averageCompletedPercent = 0;

            if (memberRecord) { //judge coachee is member or not 
                let totalCompletedPercent = 0;
                //get habits of each day of week
                let haveHabitDays = 0;
                let {
                    endOfDay
                } = convert_time_to_localtime(format(subDays(new Date(), 1), 'MM/dd/yyyy'))


                let {
                    startOfDay
                } = convert_time_to_localtime(format(subDays(new Date(), 7), 'MM/dd/yyyy'))

                let weekHabitlistPromise = get_week_habitlist(coachee._id)

                //get habit records of last seven days
                let habitsOfLastSevenDaysPromise = HabitlistRecord.find({
                    $and: [{
                            _coachee: coachee._id
                        },
                        {
                            createDate: {
                                "$gte": startOfDay
                            }
                        }, {
                            createDate: {
                                "$lte": endOfDay
                            }
                        }
                    ]
                });
                let weekListAndLastSevenDays = await Promise.all([weekHabitlistPromise, habitsOfLastSevenDaysPromise])
                weekHabitlist = weekListAndLastSevenDays[0]
                habitsOfLastSevenDays = weekListAndLastSevenDays[1]
                //get days of member
                let differenceDays = differenceInCalendarDays(new Date(), memberRecord.createdAt)
                // judge days of member less than 7
                if (differenceDays < 7) {
                    if (differenceDays < 1) {
                        averageCompletedPercent = 1
                    } else {
                        for (let i = 1; i <= differenceDays; i++) {
                            let completedHabitPercent = 0;
                            let day = getDay(subDays(new Date(), i))
                            habitsOfSpecialDay = weekHabitlist.filter(item => {
                                return item.day === daysOfWeek[day]
                            })
                            if (habitsOfSpecialDay[0].habits.length > 0) {
                                haveHabitDays += 1;
                                let {
                                    startOfDay: startTimeofDay
                                } = convert_time_to_localtime(format(subDays(new Date(), i), 'MM/dd/yyyy'))

                                if (habitsOfLastSevenDays.length > 0) {
                                    let habitsRecordOfSpecialDay = habitsOfLastSevenDays.filter(item => {
                                        return isSameDay(item.createDate, startTimeofDay)
                                    })

                                    if (habitsRecordOfSpecialDay.length > 0) {
                                        let completedHabit = habitsRecordOfSpecialDay[0].habits.filter(item => {
                                            return item.status == true
                                        })

                                        completedHabitPercent = completedHabit.length / (habitsRecordOfSpecialDay[0].habits.length)

                                    } else {
                                        completedHabitPercent = 0
                                    }

                                }
                            }
                            totalCompletedPercent += completedHabitPercent;
                        }
                    }

                } else {
                    for (let i = 1; i <= 7; i++) {
                        let completedHabitPercent = 0;
                        let day = getDay(subDays(new Date(), i))
                        habitsOfSpecialDay = weekHabitlist.filter(item => {
                            return item.day === daysOfWeek[day]
                        })
                        if (habitsOfSpecialDay[0].habits.length > 0) {
                            haveHabitDays += 1;
                            let {
                                startOfDay: startTimeofDay
                            } = convert_time_to_localtime(format(subDays(new Date(), i), 'MM/dd/yyyy'))
                            if (habitsOfLastSevenDays.length > 0) {
                                let habitsRecordOfSpecialDay = habitsOfLastSevenDays.filter(item => {
                                    return isSameDay(item.createDate, startTimeofDay)
                                })
                                if (habitsRecordOfSpecialDay.length > 0) {
                                    let completedHabit = habitsRecordOfSpecialDay[0].habits.filter(item => {
                                        return item.status == true
                                    })

                                    completedHabitPercent = completedHabit.length / (habitsRecordOfSpecialDay[0].habits.length)

                                } else {
                                    completedHabitPercent = 0
                                }

                            }
                        }
                        totalCompletedPercent += completedHabitPercent;
                    }
                }

                if (haveHabitDays >= 1) {
                    averageCompletedPercent = totalCompletedPercent / haveHabitDays
                } else {
                    averageCompletedPercent = 1
                }

                //get remaining days of member 

                remainingDaysOfMembership = differenceInCalendarDays(memberRecord.expireAt, new Date()) + 1
            } else {
                averageCompletedPercent = 0;
                remainingDaysOfMembership = 0
            }
            let coacheeImgData = ''
            coachee.imgData ? coacheeImgData = Buffer.from(coachee.imgData).toString('base64') : coacheeImgData = ""
            let convertedCoachee = {
                _id: coachee._id,
                email: coachee.email,
                name: coachee.firstName + coachee.lastName,
                imgData: coacheeImgData,
                imgType: coachee.imgType,
                averageCompletedPercent,
                remainingDaysOfMembership,
                changedWeight,
                unreadPostItems,
                unreadPostEarliestDate,
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

let get_coachee = async (req, res) => {
    let {
        coacheeId: _id
    } = req.params
    let coacheeImgData = '';
    let coachee = await Coachee.findById(_id)

    if (!coachee) throw Error('can not find coachee')
    let deserializationCoachee = JSON.parse(JSON.stringify(coachee))
    let {
        imgData,
        ...theRestOfPropertiesCoachee
    } = deserializationCoachee

    imgData ? coacheeImgData = Buffer.from(imgData).toString('base64') : coacheeImgData = ""
    let currentUser = {
        imgData: coacheeImgData,
        ...theRestOfPropertiesCoachee
    }
    res.status(200).json({
        coachee:currentUser
    })
}

let get_coach = async (req, res) => {
    let {
        coachId: _id
    } = req.params

    let coach = await Coach.findById(_id)

    if (!coach) throw Error('can not find coachee')

    res.status(200).json({
        coach
    })
}
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
module.exports = {
    signup,
    get_coachees_pagination,
    get_coachee,
    get_coach,
    get_enrolled_and_expired_members
}