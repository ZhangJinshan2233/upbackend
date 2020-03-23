'use strict'
const {
    Indicator
} = require('../models')
const {UserFacingError} = require('../middlewares').errorHandler
/**
 * create new indicator
 * @param {name, groupName, unit,isObsolete:false} req 
 * @param {*} res 
 * @returns string
 */
let create_indicator = async (req, res) => {
    let {
        name,
        group,
        unit
    } = req.body

    if (!name || !group || !unit) throw new UserFacingError('fill all space');
    let existedName = await Indicator.findOne({
        name: name
    });
    if (existedName) throw Error('indicator is existed already')
    let newIndicator = await Indicator.create(req.body)
    if (!newIndicator) throw Error('created unscressfully')
    res.status(201).json({
        message: "add successfully"
    })
};

/**
 * get all indicators 
 * @param {*} req 
 * @param {*} res 
 */
let get_indicators = async (req, res) => {
    let queryParams = req.query
    let filter = ""
    let pageSize = 3
    let numSort = -1
    let indicators = []
    let pageNumber=0
    
    if (queryParams.hasOwnProperty('name')) {
        filter = queryParams.name
    } else {
        let {
            sortOrder
        } = queryParams;
        filter = queryParams.filter
        numSort = sortOrder == 'asc' ? 1 : -1
        pageSize = parseInt(queryParams.pageSize)
        pageNumber = parseInt(queryParams.pageNumber)
    }
    try {
        indicators = await Indicator
            .find({
                name: {
                    $regex: filter
                }
            })
            .sort({
                'group': numSort
            })
            .skip(pageNumber * pageSize)
            .limit(pageSize)
        res.status(200).json({
            indicators
        })
    } catch (error) {
        throw new Error('get indicators error')
    }


};

/**
 * update one indicator based on indicator id
 * @param {*} req 
 * @param {*} res 
 */
let update_indicator = async (req, res) => {

    let {
        indicatorId
    } = req.params;
    let updatedStatus = await Indicator.findByIdAndUpdate(indicatorId, {
        $set: req.body
    })

    if (updatedStatus.n < 0) throw Error('updated unsuccessfully')
    res.status(200).json({
        message: "updated successfully"
    })
};
/**
 * get indicator by indicator id
 * @param {*} req 
 * @param {*} res 
 */
let get_indicator_by_indicator_id = async (req, res) => {
    let {
        indicatorId
    } = req.params;

    let indicator = await Indicator.findById(indicatorId).exec()

    res.status(201).json({
        indicator
    })
}

/**
 * get total indicator numbers
 */

let get_indicator_total_numbers = async (req, res) => {
    let numIndicators = 0;
    numIndicators = await Indicator.estimatedDocumentCount()
    res.status(200).json({
        numIndicators
    })
}

module.exports = {
    create_indicator,
    get_indicators,
    update_indicator,
    get_indicator_by_indicator_id,
    get_indicator_total_numbers
}