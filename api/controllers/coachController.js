const {
    Coach,
    Coachee,
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
        password,
        firstName,
        lastName
    } = req.body

    if (!email || !password || !firstName || !lastName)

        throw Error('You need to input required information')

    try {

        let coachee = await Coachee.findOne({
            email: email
        });

        let coach = await Coach.findOne({
            email: email
        });

        if (coach || coachee) throw Error('email already existed');

        let newCoach = new Coach({
            email,
            password,
            firstName,
            lastName
        });

        await newCoach.save()

        return res.status(200).json({
            msg: "registe successfully"
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
    }).select('_id')

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    coacheesPromise = Coachee.find({
            _coach: _id
        })
        .sort({
            createdAt: 1
        })
        .skip(skipNum)
        .limit(recordSize)
    let convertedCoachees = []
    [_indicator, coachees] = await Promise.all([_indicatorPromise, coacheesPromise]);

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

            [unreadMessages, unreadPosts, latestWeightRecord, memberRecord] = await Promise.all([unreadMessagesPromise, unreadPostsPromise, latestWeightRecordPromise, memberRecordPromise]);
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
                let [weekHabitlist, habitsOfLastSevenDays] = await Promise.all([weekHabitlistPromise, habitsOfLastSevenDaysPromise])

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

                remainingDaysOfMembership = differenceInCalendarDays(memberRecord.expireAt, new Date())
                console.log(remainingDaysOfMembership)
            } else {
                averageCompletedPercent = 0;
                remainingDaysOfMembership = 0
            }

            let convertedCoachee = {
                _id: coachee._id,
                email: coachee.email,
                name: coachee.firstName + coachee.lastName,
                imgData: coachee.imgData,
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

    coachee = await Coachee.findById(_id)

    if (!coachee) throw Error('can not find coachee')

    res.status(200).json({
        coachee
    })
}
module.exports = {
    signup,
    get_coachees_pagination,
    get_coachee
}