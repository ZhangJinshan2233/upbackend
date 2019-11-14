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
        let membershipEndDate = null;
        let coachee = await Coachee.findById(_coachee).select('_id _coach membershipEndDate userType')
        if (coachee.userType === "publicCoachee") {
            membershipEndDate = membershipEndDateObject['publicCoachee'](memberCategory.duration)
        } else {
            membershipEndDate = membershipEndDateObject['freeCoacheeAndPremiumCoachee'](coachee.membershipEndDate, memberCategory.duration)

        }
        let newMembership = await Membership.create({
            _coachee,
            _membershipCategory,
        })
        await Coachee.findByIdAndUpdate(_coachee, {
            $set: {
                membershipEndDate,
                userType: 'premiumCoachee',
                _coach
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