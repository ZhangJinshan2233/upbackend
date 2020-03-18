'use strict'
const {
    MemberRecord,
    Coachee,
    MembershipCategory,
    Membership
} = require('../models')
const {
    Types
} = require('mongoose');
const {
    addDays
} = require('date-fns')
/**
 * create new challenge record
 * @param {_challenge,value,createDate} req 
 * @param {*} res 
 */
let create_member_record = async (req, res) => {
    let {
        membershipCategory,
        coachees
    } = req.body
    console.log(req.body)
    if (!membershipCategory || !coachees.length)
        throw Error('less information');
    let assignMembershipPromises = []
    let memberCategory = await MembershipCategory.findById(membershipCategory)
    for (let _coachee of coachees) {
        let membershipReocrdPromise = MemberRecord.findOne({
            _coachee: _coachee
        })
        let newMembershipPromise = Membership.create({
            _coachee: _coachee,
            _membershipCategory: memberCategory._id
        });
        let [membershipReocrd, newMembership] = await Promise.all([membershipReocrdPromise, newMembershipPromise])

        if (membershipReocrd) {
            let expireDate = addDays(new Date(membershipReocrd.expireAt), memberCategory.duration)
            let memberRecordPromise = membershipReocrd.updateOne({
                $set: {
                    expireAt: expireDate
                },
                $push:{
                    memberships:{_membership:newMembership._id}
                }
            })
            assignMembershipPromises.push(memberRecordPromise)
        } else {
            let memberRecordPromise = MemberRecord.create({
                _coachee: _coachee,
                memberships:[{_membership:newMembership._id}],
                expireAt: addDays(Date.now(), memberCategory.duration)
            })
            assignMembershipPromises.push(memberRecordPromise)
            let updateMembershipStatusPromise = Coachee.findByIdAndUpdate(_coachee, {
                $set: {
                    isMember: true
                }
            })
            assignMembershipPromises.push(updateMembershipStatusPromise)
        }
    }
    await Promise.all(assignMembershipPromises)
    res.status(201).json({
        message: "created successfully"
    })
}

/**
 * get latest record of all challenges
 * @param {*} req 
 * @param {*} res 
 */
let get_member_record_by_coachee = async (req, res) => {

    let {
        coacheeId
    } = req.query
    let memberRecord =null
    memberRecord = await MemberRecord.findOne({
        _coachee: Types.ObjectId(coacheeId)
    }).select('expireAt')
    res.status(200).json({
        memberRecord
    })
}

/**
 * create new comment 
 * @params {req.params}
 *          {req.body}
 * @returns string
 */
module.exports = {
    create_member_record,
    get_member_record_by_coachee
}