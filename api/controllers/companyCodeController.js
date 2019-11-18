'use strict'
const {
    CompanyCode,
    Coachee
} = require('../models')
const {
    Types
} = require('mongoose');
const {
    addDays
} = require('date-fns');
const randomCode = require('rand-token')
/**
 * create new company code
 * @param {} req 
 * @param {*} res 
 */
let create_company_code = async (req, res) => {
    let {
        companyName,
        numbers: numbersOfMembers
    } = req.body

    let company = await CompanyCode.findOne({
        companyName
    })

    if (company) {
        throw Error('company name existed')
    }

    let code = randomCode.generate(6)

    let companyCode = await CompanyCode.create({
        code,
        expireAt: addDays(new Date(), 7),
        companyName,
        numbersOfMembers
    })

    if (!companyCode) throw Error("failed to create code")
    res.status(201).json({
        companyCode
    })
}

/**
 * get company name by company code
 * @param {*} req 
 * @param {*} res 
 */
let get_company_code = async (req, res) => {

    let {
        companyCode:code
    } = req.query;
    let companyInfo = await CompanyCode.findOne({
        code
    })

    if(!companyInfo){
        throw Error('company code does not exist')
    }
    res.status(200).json({
        companyInfo
    })
}

module.exports = {
    create_company_code,
    get_company_code
}