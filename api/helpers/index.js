'use strict'
const config = require('../config');
const jwt = require('jsonwebtoken');
const {
    addDays,
    compareAsc
} = require('date-fns')
const nodemailer = require('nodemailer');
const {
    ChatRoom,
    Coachee,
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
            firstTimeLogin: user.firstTimeLogin
        },
        config.jwtSecret, {
            expiresIn: 15000
        })
}
/**
 * @function send mail
 * @param {*} toEmail 
 * @param {*} subjectData 
 * @param {*} htmlData 
 * @returns 
 */
let send_email = async (toEmail, subjectData, htmlData) => {

    let transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: false,
        auth: {
            user: process.env.MAILJET_API_KEY || config.emailAuth.user,
            pass: process.env.MAILJET_API_SECRET || config.emailAuth.pass
        }
    });
    try {
        let info = await transporter.sendMail({
            from: config.supportEmail,
            to: toEmail,
            subject: subjectData,
            html: htmlData,
        })
    } catch (error) {
        console.log(error)
    }

};

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

let errorHandler = async (asyncFunc) => {
    try {
        let res = await asyncFunc()
        return [null, res]
    } catch (e) {
        return [e, null]
    }
};

let set_membershipEndDate_less_than_currentDate = function (duration) {
    return new Date(addDays(new Date(), duration))
};

let set_membershipEndDate_bigger_than_currentDate = function (endDate, duration) {
    return new Date(addDays(endDate, duration))
}

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

let get_rating_description = function (rating) {
    let description = ''
    switch (true) {
        case (rating > 5):
            description = "Full of great nutrition. This is an everyday food choice";
            break;
        case (rating >= 4.1):
            description = "Full of great nutrition. This is an everyday food choice"
            break;
        case (rating >= 3.1):
            description = 'Mostly full of good nutrition, but lacking some key nutrients. This is an everyday food choice.'
            break;
        case (rating >= 2.1):
            description = 'Some good nutrition, but could be better. Choose no more than 2-3 times a week.'
            break;
        case (rating >= 1.1):
            description = 'Not the worst choice, but highly processed Choose less than once a week.'
            break;
        case (rating = 1):
            description = 'High in fat, sugar or salt Choose less than once a week.'
            break;
        default:
            description = ""
            break;
    }
    return description
}

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
module.exports = {
    create_token,
    send_email,
    convert_time_to_localtime,
    errorHandler,
    membershipEndDateObject,
    get_rating_description,
    get_week_habitlist 
}