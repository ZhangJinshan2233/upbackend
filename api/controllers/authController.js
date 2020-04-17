'use strict'
const {
    Coach,
    AdminCoach,
    CommonCoach,
    Coachee,
    MemberRecord
} = require('../models');
const _h = require('../helpers');
const bcrypt = require('bcrypt');
const randToken = require('rand-token');
const {
    UserFacingError
} = require('../middlewares/index').errorHandler
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
    console.log(coachee)
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
        //prevent unavailable coach from logging in
        coach = await Coach.findOne({
            $and: [{
                email: email
            }, {
                status: true
            }]
        })
    }
    currentUser = coachee ? coachee : coach;

    if (!currentUser) throw new UserFacingError('Non-existed user');

    isMatch = await currentUser.comparePassword(password);

    if (!isMatch) throw new UserFacingError('The user ID and password don\'t match.');
    if (currentUser.userType === 'Coachee') {
        await currentUser.updateOne({
            $set: {
                lastTimeLogin: Date.now()
            }
        }).exec()
    }

    return res.status(200).json({
        access_token: _h.create_token(currentUser)
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
    if (!currentUser) throw new UserFacingError('Non-existd email')
    let randPassword = randToken.uid(6);
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(randPassword, salt);
    await currentUser.updateOne({
        $set: {
            password: hash
        }
    }).exec()
    _h.send_support_email(email, currentUser.firstName, randPassword);
    res.status(200).json({
        message: 'set random password successfully'
    })
}

/**
 * get whole info (this function can get common coach and coachee info)
 * @function get_whole_userInfo
 * @return JSON object
 */
let get_whole_userInfo = async (req, res, next) => {
    let currentUser = {};
    let {
        _id,
        userType
    } = req.user
    if (userType == "Coachee") {
        let coachee = await Coachee.findById(_id)
            .populate('_coach', '_id firstName lastName imgType imgData')
        let deserializationCoachee = JSON.parse(JSON.stringify(coachee))

        let {
            imgData: coacheeImgData,
            _coach,
            ...theRestOfPropertiesCoachee
        } = deserializationCoachee

        let {
            imgData: coachImgData,
            ...theRestOfPropertiesCoach
        } = _coach

        coachImgData ? coachImgData = Buffer.from(coachImgData).toString('base64') : coachImgData = ""
        coacheeImgData ? coacheeImgData = Buffer.from(coacheeImgData).toString('base64') : coacheeImgData = ""

        let coach = {
            imgData: coachImgData,
            ...theRestOfPropertiesCoach
        }
        currentUser = {
            imgData: coacheeImgData,
            _coach: coach,
            ...theRestOfPropertiesCoachee
        }
    } else {
        let coach = {}
        if (userType == 'CommonCoach') {
            //if have some special property need use model which have this property
            coach = await CommonCoach.findById(_id).populate({
                path: 'specialities._speciality',
                select: 'name'
            })
        } else {
            coach = await AdminCoach.findById(_id)
        }
        //prevent theRestOfPropertiesCoach passing parent class of coach object
        let deserializationCoach = JSON.parse(JSON.stringify(coach))
        let {
            imgData,
            ...theRestOfPropertiesCoach
        } = deserializationCoach
        let coachImgData = ""
        if (imgData) {
            coachImgData = Buffer.from(imgData).toString('base64')
        }
        currentUser = {
            imgData: coachImgData,
            ...theRestOfPropertiesCoach
        }

    }
    return res.status(200).json({
        currentUser
    })
};

/**
 * change password
 * @param {password} req 
 * @param {*} res 
 */
let change_password = async (req, res) => {
    let currentUser = {};
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
            currentUser = await Coachee.findById(_id)
            isMatch = await currentUser.comparePassword(currentPassword)

        } else {
            currentUser = await Coach.findById(_id)
            isMatch = await currentUser.comparePassword(currentPassword)
        }
        if (!isMatch) throw UserFacingError('The user ID and password don\'t match.');

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
 *coachee and common coach self update  profile
 * @function update profile
 * @param {profile Info}
 */
let update_profile_field = async (req, res) => {
    let {
        _id,
        userType
    } = req.user;
    let changedFields = req.body
    let currentUser = {}
    if (userType === 'Coachee') {
        currentUser = await Coachee.findById(_id)
    } else {
        currentUser = await CommonCoach.findById(_id)
    }
    if (Object.keys(req.body).includes('imgData')) {
        let {
            imgData,
            ...otherProperties
        } = req.body
        let bufferImgData = Buffer.from(imgData, 'base64')
        await currentUser.updateOne({
            $set: {
                imgData: bufferImgData,
                ...otherProperties
            }
        }).exec()
    } else {
        await currentUser.updateOne({
            $set: {
                ...changedFields
            }
        }).exec()
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