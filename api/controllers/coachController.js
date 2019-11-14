const {
    Coach,
    Coachee,
    UnreadNotification,
    Indicator,
    Habit,
    HabitlistRecord,
    IndicatorRecord
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

let get_coachees_pagination = async (req, res) => {
    let {
        _id
    } = req.user;
    let skipNum = parseInt(req.query.skipNum) || 0;
    let recordSize = 5;
    let coachees = []

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    coachees = await Coachee.find({
            _coach: _id
        })
        .sort({
            createdAt: 1
        })
        .skip(skipNum)
        .limit(recordSize)
    let convertedCoachees = []
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
            //get unreadNotifications
            unreadMessages = await UnreadNotification.find({
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
            if (unreadMessages.length > 0) {
                unreadMessageItems = unreadMessages.length;
                unreadMessageEarliestDate = unreadMessages[0].createdAt
            }
            unreadPosts = await UnreadNotification.find({
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
            if (unreadPosts.length > 0) {
                unreadPostItems = unreadPosts.length;
                unreadPostEarliestDate = unreadPosts[0].createdAt
            }

            //get latest weight record;

            let _indicator = await Indicator.findOne({
                name: "weight"
            }).select('_id')

            let latestWeightRecord = await IndicatorRecord.findOne({
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
            if (latestWeightRecord) {
                changedWeight = latestWeightRecord.value - coachee.weight
            }

            let {
                endOfDay
            } = convert_time_to_localtime(format(subDays(new Date(), 1), 'MM/dd/yyyy'))
            let {
                startOfDay
            } = convert_time_to_localtime(format(subDays(new Date(), 7), 'MM/dd/yyyy'))
            let weekHabitlist = await get_week_habitlist(coachee._id)
            habitsOfLastSevenDays = await HabitlistRecord.find({
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
            let differenceDays = differenceInCalendarDays(new Date(), coachee.membershipStartDate)
            let totalCompletedPercent = 0;
            let averageCompletedPercent = 0;
            let haveHabitDays = 0;
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
            if (coachee.membershipEndDate >= new Date()) {
                remainingDaysOfMembership = differenceInCalendarDays(coachee.membershipEndDate, new Date())
            } else {
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