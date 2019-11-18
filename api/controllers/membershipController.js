'use strict'
const {
    Membership,
    MembershipCategory,
    Coachee
} = require('../models')
const {
    membershipEndDateObject
} = require('../helpers')
const {
    Types
} = require('mongoose');
/**
 * create new challenge record
 * @param {_challenge,value,createDate} req 
 * @param {*} res 
 */
let create_membership = async (req, res) => {
    let {
        membershipCategory: _membershipCategory,
        coachees,
        coach: _coach
    } = req.body
    let memberCategory = await MembershipCategory.findById(_membershipCategory)
    if (!_membershipCategory || !coachees.length || !_coach)
        throw Error('less information');
    for (let _coachee of coachees) {
        let coachee = await Coachee.findById(_coachee).select('_id _coach isMember userType')
        let newMembership = await Membership.create({
            endDate: addDays(Date.now(), memberCategory.duration),
            _coachee: coachee._id,
            _membershipCategory: memberCategory._id
        })
        if (!newMembership) throw Error('failed to register')

        let memberRecord = await MemberRecord.create({
            _coachee: coachee._id,
            _membership: newMembership._id,
            expireAt: addDays(new Date(), memberCategory.duration)
        })
        await Coachee.findByIdAndUpdate(_coachee, {
            $set: {
                _coach,
                isMember: true
            }
        })
        if (!newMembership) throw Error('created membership unsuccessfully')
    }
    res.status(201).json({
        message: "created successfully"
    })
}

/**
 * get latest record of all challenges
 * @param {*} req 
 * @param {*} res 
 */
let get_membership_by_coachee = async (req, res) => {

}

/**
 * create new comment 
 * @params {req.params}
 *          {req.body}
 * @returns string
 */
module.exports = {
    create_membership
}