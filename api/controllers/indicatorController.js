'use strict'
const {Indicator} = require('../models')
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

    if (!name || !group || !unit) throw Error('fill all space');
    let existedName = await Indicator.findOne({
        name: name
    });
    if (existedName) throw Error('indicator is existed already')
    let newIndicator = await Indicator.create(req.body)
    if (!newIndicator) throw Error('created unscressfully')
    res.status(201).json({
        newIndicator
    })
};

/**
 * get all indicators 
 * @param {*} req 
 * @param {*} res 
 */
let get_indicators = async (req, res) => {
    let indicators = []
    let {
        name
    } = req.query
    if (name) {
        indicators = await Indicator.find({
            name: name
        })
    } else {
        indicators = await Indicator.find()
    }

    res.status(200).json({
        indicators
    })
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
    }).exec()

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


module.exports = {
    create_indicator,
    get_indicators,
    update_indicator,
    get_indicator_by_indicator_id
}