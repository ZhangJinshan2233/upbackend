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

let create_transport = (user, pass) => {
    let transporter = nodemailer.createTransport({
        host: config.emailHost,
        port: config.emailPort,
        secure: false,
        auth: {
            user: process.env.MAILJET_API_KEY || user,
            pass: process.env.MAILJET_API_SECRET || pass
        }
    });
    return transporter
}

let send_multiple_welcome_email = (newCoachees) => {
    let emailContent = "Welcome to the UP Health community. " +
        "You'll find no where like this where great place where" +
        " friendships meet professional coaching so that becoming " +
        "healthy becomes more fun and desirable. " +
        "We can't wait for you to join us and work " +
        "toward achieving your health goals together."
    let subjectData = "Registration from UPHealth";
    let transporter = create_transport(config.welcomeEmailAuth.user, config.welcomeEmailAuth.pass)
    let sendPromises = []
    newCoachees.forEach(newCoachee => {
        let htmlData =
            "<html>Hey " + newCoachee.firstName + ",<br/><br/>" + emailContent + "<br/><br/><Table><TR ALIGN='Left'><TD><a href='http://www.uphealth.sg'><img src='http://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/88884/145502_842983.png' height='150' alt='UP logo'></a></TD><TD>Cheering you on,<br>UP Welcome Team <br>T: (+65) 6743 4010<br>W: uphealth.sg <br><br><b><i>UP your health, UP your life!</b></i></TD></TR></Table><br></html>";
        let sendPromise = transporter.sendMail({
            from: config.welcomeEmail,
            to: newCoachee.email,
            subject: subjectData,
            html: htmlData,
        })
        sendPromises.push(sendPromise)
    })

    return sendPromises
}

let organize_email = async (user, pass, fromEmail, toEmail, subjectData, htmlData) => {
    let transporter = create_transport(user, pass)
    try {
        let info = await transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: subjectData,
            html: htmlData,
        })
    } catch (error) {
        console.log("send unsuccessfully", toEmail)
    }
}
/**
 * @function send mail
 * @param {*} toEmail 
 * @param {*} subjectData 
 * @param {*} htmlData 
 * @returns 
 */
let send_welcome_email = (toEmail, firstName) => {
    let emailContent = "Welcome to the UP Health community. " +
        "You'll find no where like this where great place where" +
        " friendships meet professional coaching so that becoming " +
        "healthy becomes more fun and desirable. " +
        "We can't wait for you to join us and work " +
        "toward achieving your health goals together."

    let subjectData = "Registration from UPHealth";
    let htmlData =
        "<html>Hey " + firstName + ",<br/><br/>" + emailContent + "<br/><br/><Table><TR ALIGN='Left'><TD><a href='http://www.uphealth.sg'><img src='http://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/88884/145502_842983.png' height='150' alt='UP logo'></a></TD><TD>Cheering you on,<br>UP Welcome Team <br>T: (+65) 6743 4010<br>W: uphealth.sg <br><br><b><i>UP your health, UP your life!</b></i></TD></TR></Table><br></html>";
    organize_email(config.welcomeEmailAuth.user,
        config.welcomeEmailAuth.pass,
        config.welcomeEmail,
        toEmail,
        subjectData,
        htmlData)
};
let send_support_email = async (toEmail, firstName, randPassword) => {
    let subjectData = "Reset password";
    let htmlData =
        "<html>Hey " + firstName +
        ",<br/><br/> We've glad to have changed your password to " + "<p style='color:red'>" + randPassword + "</p>" +
        " so that you're able to login and connect with your UP Community soon!<br/><br/>You may change the password again if you like in your Settings page in our app.<br/><br/><Table><TR ALIGN='Left'><TD><a href='http://www.uphealth.sg'><img src='http://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/88884/145502_842983.png' height='150' alt='UP logo'></a></TD><TD>Cheering you on,<br>UP Welcome Team <br>T: (+65) 6743 4010<br>W: uphealth.sg <br><br><b><i>UP your health, UP your life!</b></i></TD></TR></Table><br></html>";
    organize_email(config.supportEmailAuth.user,
        config.supportEmailAuth.pass,
        config.supportEmail,
        toEmail,
        subjectData,
        htmlData)
};


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

/**
 * get rateing description for food journal challenge
 * @param {*} rating 
 */
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
    send_welcome_email,
    create_token,
    send_support_email,
    convert_time_to_localtime,
    errorHandler,
    membershipEndDateObject,
    get_rating_description,
    get_week_habitlist,
    convertBase64ToBuffer,
    convertBufferToBase64,
    send_multiple_welcome_email
}