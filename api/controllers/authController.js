'use strict'
const {
    Coach,
    Coachee,
    MemberRecord
} = require('../models');
const helpers = require('../helpers');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');
const h = require('../helpers')
const refreshTokens = {};
const {
    compareDesc,
    compareAsc
} = require('date-fns');
/**
 * @function signin.
 * @public
 * @param {req.body}:email password
 * @returns string.
 */

let signin = async (req, res) => {
    let {
        email,
        password
    } = req.body
    let currentUser = {};
    let coach = {};
    let coachee = {};
    let isMatch = false;
    coachee = await Coachee.findOne({
        email: email
    })
    if (coachee) {
        let isMember = await MemberRecord.findOne({
            _coachee: coachee._id
        })
        if (!isMember) {
            await Coachee.findByIdAndUpdate(coachee._id, {
                $set: {
                    isMember: false
                }
            })
        }

    }
    if (!coachee) {
        coach = await Coach.findOne({
            email: email
        })

    }
    currentUser = coachee ? coachee : coach;

    if (!currentUser) throw new Error('Non-existed user');

    isMatch = await currentUser.comparePassword(password);

    if (!isMatch) throw Error('The user ID and password don\'t match.');

    await currentUser.updateOne({
        $set: {
            lastTimeLogin: Date.now()
        }
    }).exec()
    return res.status(200).json({
        access_token: helpers.create_token(currentUser)
    });

};

/**
 * @function forget password
 * @param email
 * @return json
 */
let forgot_password = async (req, res) => {
    let currentUser = {};
    let coach = {};
    let coachee = {};
    let email = req.body.email;
    coachee = await Coachee.findOne({
        email: email
    })
    if (!coachee) {
        coach = await Coach.findOne({
            email: email
        })
    }
    currentUser = coachee ? coachee : coach;
    if (!currentUser) throw new Error('Non-existd email')
    let randPassword = randToken.uid(6);
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(randPassword, salt);
    await currentUser.updateOne({
        $set: {
            password: hash
        }
    }).exec()

    let subjectData = "Reset password";
    let htmlData =
        "<html>Hey " + currentUser.firstName +
        ",<br/><br/> We've glad to have changed your password to" + randPassword +
        "so that you're able to login and connect with your UP Community soon!<br/><br/>You may change the password again if you like in your Settings page in our app.<br/><br/><Table><TR ALIGN='Left'><TD><a href='http://www.uphealth.sg'><img src='http://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/88884/145502_842983.png' height='150' alt='UP logo'></a></TD><TD>Cheering you on,<br>UP Welcome Team <br>T: (+65) 6743 4010<br>W: uphealth.sg <br><br><b><i>UP your health, UP your life!</b></i></TD></TR></Table><br></html>";
    h.send_email(email, subjectData, htmlData);
    res.status(200).json({
        message: 'set random password successfully'
    })
}

/**
 * @function get whole info
 * @return JSON object
 */
let get_whole_userInfo = async (req, res, next) => {
    let user = {}
    let coachee = {};
    let coach = {};
    let {
        _id
    } = req.user
    coachee = await Coachee.findOne({
            _id: _id
        })
        .populate('_coach', 'firstName lastName imgType imgData')

    if (!coachee) {
        coach = await Coach.findOne({
            _id: _id
        });
    }
    user = coachee ? coachee : coach

    let currentUser = JSON.parse(JSON.stringify(user))

    return res.status(200).json({
        currentUser: currentUser
    })
};

let change_password = async (req, res, next) => {
    let currentUser = null
    let isMatch = false;
    let {
        _id,
        userType
    } = req.user
    let {
        currentPassword,
        newPassword
    } = req.body
    try {
        if (userType == "Coachee") {

            currentUser = await Coachee.findOne({
                _id: _id
            })

            isMatch = await currentUser.comparePassword(currentPassword)

        } else {
            currentUser = await Coach.findOne({
                _id: _id
            });
            isMatch = currentUser.comparePassword(currentPassword)
        }

        if (!isMatch) throw Error('The user ID and password don\'t match.');

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(newPassword, salt);

        await currentUser.updateOne({
            $set: {
                password: hash
            }
        }).exec();

        res.status(200).json({
            message: "newPassword"
        })

    } catch (err) {
        throw err
    }

};

/**
 * @function update profile
 * @param {profile Info}
 */
let update_profile_field = async (req, res) => {
    let {
        _id
    } = req.user;
    let currentUser = null
    let coach = {};
    let coachee = {};

    let changedFields = JSON.parse(JSON.stringify(req.body));

    if (!changedFields) throw Error('nothing to be changed');

    coachee = await Coachee.findOne({
        _id: _id
    })

    if (!coachee) {
        coach = await Coach.findOne({
            _id: _id
        })
    }

    currentUser = coachee ? coachee : coach;

    await currentUser.updateOne({
        $set: changedFields
    }).exec()

    if (coachee && coachee.firstTimeLogin) {
        await currentUser.updateOne({
            $set: {
                firstTimeLogin: false
            }
        })
    }
    res.status(200).json({
        message: "updated successfully"
    })
}

module.exports = {
    signin,
    forgot_password,
    get_whole_userInfo,
    change_password,
    update_profile_field
}