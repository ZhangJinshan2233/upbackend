'use strict'
const config = require('../config');
const jwt = require('jsonwebtoken');
const {
    addDays,
    compareAsc
} = require('date-fns')
const {
    Habit
} = require('../models')

const {
    Types
} = require('mongoose')
/**
 * @function create_token.
 * @param   {user} pass the userinfo:username
 * @returns string.
 */

let create_token = (user) => {

    return jwt.sign({
            _id: user._id,
            email: user.email,
            userType: user.userType,
            firstTimeLogin: user.firstTimeLogin,
            goal:user.goal,
            isMember:user.isMember
        },
        config.jwtSecret, {
            expiresIn: 15000
        })
}

/**
 * convert time to local time
 * @param {*} time string 
 */
let convert_time_to_localtime = (timestring) => {

    let convertTimeToDateFormat = new Date(timestring);
    let offsetTime = convertTimeToDateFormat.getTimezoneOffset();
    let startOfDay = new Date(convertTimeToDateFormat.getTime() - offsetTime * 60000)
    let endOfDay = new Date(new Date(convertTimeToDateFormat.getTime() - offsetTime * 60000).setUTCHours(23, 59, 59, 999));
    return {
        startOfDay,
        endOfDay
    }
};
/**
 * 
 * @param {*} asyncFunc 
 */
let errorHandler = async (asyncFunc) => {
    try {
        let res = await asyncFunc()
        return [null, res]
    } catch (e) {
        return [e, null]
    }
};

/**
 * 
 */
let set_membershipEndDate_less_than_currentDate = function (duration) {
    return new Date(addDays(new Date(), duration))
};
/**
 * 
 * @param {*} endDate 
 * @param {*} duration 
 */
let set_membershipEndDate_bigger_than_currentDate = function (endDate, duration) {
    return new Date(addDays(endDate, duration))
}
/**
 * 
 * @param {*} endDate 
 * @param {*} duration 
 */
let set_membershipEndDate = function (endDate, duration) {
    if (compareAsc(endDate, new Date())) {
        return set_membershipEndDate_bigger_than_currentDate(endDate, duration)
    } else {
        return set_membershipEndDate_less_than_currentDate(duration)
    }
}

const membershipEndDateObject = {
    "publicCoachee": set_membershipEndDate_less_than_currentDate,
    "freeCoacheeAndPremiumCoachee": set_membershipEndDate
}

/**
 * get all the habit of week for special coachee
 * @param {*} coacheeId 
 * @returns week habit list
 */
let get_week_habitlist = async (coacheeId) => {
    let habitsOfWeek = await Habit.aggregate([{
            $match: {
                $and: [{
                    _coachee: Types.ObjectId(coacheeId)
                }, {
                    isObsolete: false
                }]

            }
        },
        {
            $unwind: {
                path: "$daysOfWeek"
            }
        },
        {
            $group: {
                "_id": "$daysOfWeek",
                habits: {
                    "$addToSet": {
                        "name": "$name",
                        "status": false
                    }
                }
            }
        }
    ])
    let weekHabitlist = [{
            day: 'Sunday',
            habits: []
        },
        {
            day: 'Monday',
            habits: []
        },
        {
            day: 'Tuesday',
            habits: []
        },
        {
            day: 'Wednesday',
            habits: []
        },
        {
            day: 'Thursday',
            habits: []
        }, {
            day: 'Friday',
            habits: []
        }, {
            day: 'Saturday',
            habits: []
        }
    ];
    if (habitsOfWeek.length > 0) {
        for (let i = 0; i < weekHabitlist.length; i++) {
            for (let j = 0; j < habitsOfWeek.length; j++)
                if (weekHabitlist[i].day === habitsOfWeek[j]._id) {
                    weekHabitlist[i].habits = habitsOfWeek[j].habits
                }
        }
    }

    return weekHabitlist
}

/**
 * convert image of base64 format to buffer
 * @param {*} imgData 
 */
let convertBase64ToBuffer = (imgData) => {
    let bufferImgData = Object.create(null)
    if (imgData) {
        bufferImgData = Buffer.from(imgData, 'base64')
    }
    return bufferImgData
}
/**
 * convert image of buffer format to base64
 * @param {*} imgData 
 */
let convertBufferToBase64 = (imgData) => {
    let base64ImgData = Object.create(null)
    if (imgData) {
        base64ImgData = Buffer.from(imgData).toString('base64');
    }
    return base64ImgData
}
module.exports = {
    create_token,
    convert_time_to_localtime,
    errorHandler,
    membershipEndDateObject,
    get_week_habitlist,
    convertBase64ToBuffer,
    convertBufferToBase64
}