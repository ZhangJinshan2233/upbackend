'use strict'
const {
    MemberRecord,
    Coachee
} = require('../models')
const {
    Types
} = require('mongoose');
/**
 * create new challenge record
 * @param {_challenge,value,createDate} req 
 * @param {*} res 
 */
let create_member_record = async (req, res) => {

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
    let isMember = true
    let memberRecord = await MemberRecord.findOne({_coachee:Types.ObjectId(coacheeId)})
    if (!memberRecord) isMember = false

    res.status(200).json({
        isMember
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