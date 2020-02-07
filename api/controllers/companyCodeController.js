'use strict'
const {
    CompanyCode
} = require('../models')
const randomCode = require('rand-token')
/**
 * create new company code
 * @param {} req 
 * @param {*} res 
 */
let create_company_code = async (req, res) => {
    let {
        companyName,
        description
    } = req.body

    let company = await CompanyCode.findOne({
        companyName: companyName
    })

    if (company) {
        throw Error('company name or code existed')
    }

    let code = randomCode.generate(6).toLowerCase()

    let companyCode = await CompanyCode.create({
        code,
        companyName,
        description
    })

    if (!companyCode) throw Error("failed to create code")
    res.status(200).json({
        companyCode
    })
}

/**
 * get company infos
 * @param {*} req 
 * @param {*} res 
 */

let get_companyCodes_pagiantion = async (req, res) => {
    let queryParams = req.query
    let filter = ""
    let pageSize = 3
    let numSort = -1
    let companyCodes = []
    let {
        sortOrder
    } = queryParams;
    filter = queryParams.filter
    numSort = sortOrder == 'asc' ? 1 : -1
    pageSize = parseInt(queryParams.pageSize)
    let pageNumber = parseInt(queryParams.pageNumber) || 0
    try {
        companyCodes = await CompanyCode
            .find({
                companyName: {
                    $regex: filter
                }
            })
            .sort({
                'companyName': numSort
            })
            .skip(pageNumber * pageSize)
            .limit(pageSize)
        res.status(200).json({
            companyCodes
        })
    } catch (error) {
        throw new Error('get healthytips error')
    }
};

/**
 * update one companyCode based on companyCode id
 * @param {*} req 
 * @param {*} res 
 */
let update_companyCode = async (req, res) => {
    let {
        companyCodeId: _id
    } = req.params
    await CompanyCode.findByIdAndUpdate(_id, {
        $set: {
            ...req.body
        }
    })
    res.status(200).json({
        message: "updated successfully"
    })
};
/**
 * get companyCode by companyCode id
 * @param {*} req 
 * @param {*} res 
 */
let get_companyCode = async (req, res) => {
    let companyCode = {}
    let {
        companyCodeId: _id
    } = req.params
    companyCode = await CompanyCode.findById(_id)
    //prevent theRestOfPropertiesCoach passing parent class of coach object

    res.status(200).json({
        companyCode
    })
}

/**
 * get total companyCode numbers
 */

let get_companyCode_total_numbers = async (req, res) => {
    let numCompanyCodes = 0;
    numCompanyCodes = await CompanyCode.estimatedDocumentCount()
    res.status(200).json({
        numCompanyCodes
    })
}
module.exports = {
    create_company_code,
    get_companyCodes_pagiantion,
    get_companyCode_total_numbers,
    get_companyCode,
    update_companyCode
}