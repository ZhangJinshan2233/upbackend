'use strict'
const {
    Indicator,
    IndicatorRecord,
    Coachee
} = require('../models');
const {
    Types
} = require('mongoose');
const _ = require('lodash');
const {
    UserFacingError
} = require('../middlewares').errorHandler
/**
 * create new indicator record
 * @param {_indicator,value,createDate} req 
 * @param {*} res 
 */
let create_indicator_record = async (req, res) => {
    let {
        _id: _coachee
    } = req.user

    let {
        name,
        createDate,
        ...otherFields
    } = req.body
    let record = {};
    let convertTimeToDateFormat = new Date(createDate);
    let startOfDay = new Date(new Date(createDate).setUTCHours(0, 0, 0, 0))
    let endOfDay = new Date(new Date(createDate).setUTCHours(23, 59, 59, 999))
    let _indicator = await Indicator.findOne({
        name: name
    })

    let haveSameDateRecord = await IndicatorRecord.findOneAndUpdate({
        $and: [{
                _coachee: Types.ObjectId(_coachee)
            },
            {
                isObsolete: false
            },
            {
                _indicator: _indicator._id
            },
            {
                createDate: {
                    $gte: startOfDay
                }
            },
            {
                createDate: {
                    $lte: endOfDay
                }
            }
        ]
    }, {
        $set: {
            createDate: convertTimeToDateFormat,
            ...otherFields
        }
    }).exec();

    if (haveSameDateRecord) {
        record = haveSameDateRecord
    } else {
        let newRecord = await IndicatorRecord.create({
            _coachee,
            _indicator: _indicator._id,
            createDate: convertTimeToDateFormat,
            ...otherFields
        })
        if (!newRecord) throw Error('created wrong')
        record = newRecord
    }

    let fullPropertiesRecord = await IndicatorRecord.findById(record._id)

    let newIndicatorRecord = {
        _id: fullPropertiesRecord._id,
        name: fullPropertiesRecord._indicator.name,
        group: fullPropertiesRecord._indicator.group,
        value: fullPropertiesRecord.value,
        unit: fullPropertiesRecord._indicator.unit,
        status: "Normal",
        _coachee: fullPropertiesRecord._coachee,
        createDate: fullPropertiesRecord.createDate,

    }
    res.status(200).json({
        newRecord: newIndicatorRecord
    })
};

/**
 * get indicator record by indicator name
 * @param {*} req 
 * @param {*} res 
 */
let get_month_record_by_indicator_name = async (req, res) => {
    let _coachee = ""
    let {
        _id,
        userType
    } = req.user

    if (userType.includes("Coachee")) {
        _coachee = _id
    } else {
        _coachee = req.query.coacheeId
    }
    let {
        indicatorName: name
    } = req.params;
    let {
        startDate,
        endDate
    } = req.query
    let _indicator = await Indicator.findOne({
        name: name
    })
    if (startDate && endDate) {
        let convertStartDateToDateFormat = new Date(startDate)
        let convertEndDateToDateDormat = new Date(endDate)
        let indicatorRecords = await IndicatorRecord.find({
            $and: [{
                    _coachee: Types.ObjectId(_coachee)
                },
                {
                    _indicator: _indicator._id
                },
                {
                    isObsolete: false
                },
                {
                    createDate: {
                        $gte: convertStartDateToDateFormat
                    }
                },
                {
                    createDate: {
                        $lte: convertEndDateToDateDormat
                    }
                }
            ]
        }).sort({
            createDate: -1
        })
        res.status(200).json({
            indicatorRecords
        })
    } else {
        let latestRecord = IndicatorRecord.findOne({
                $and: [{
                        _coachee
                    },
                    {
                        _indicator: _indicator._id
                    },
                    {
                        isObsolete: false
                    }
                ]
            })
            .sort({
                createDate: -1
            })
        res.status(200).json({
            latestRecord
        })
    }
}
/**
 * get year record by indicator name
 * @param {*} req 
 * @param {*} res 
 */
let get_year_record_by_indicator_name = async (req, res) => {
    let {
        _id: _coachee
    } = req.user
    let {
        indicatorName: name
    } = req.params;
    let {
        startDate,
        endDate
    } = req.query
    let _indicator = await Indicator.findOne({
        name: name
    })
    let convertStartDateToDateFormat = new Date(startDate)
    let convertEndDateToDateDormat = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999))
    let indicatorRecords = await IndicatorRecord.find({
        $and: [{
                _coachee: Types.ObjectId(_coachee)
            },
            {
                _indicator: _indicator._id
            },
            {
                isObsolete: false
            },
            {
                createDate: {
                    $gte: convertStartDateToDateFormat
                }
            },
            {
                createDate: {
                    $lte: convertEndDateToDateDormat
                }
            }
        ]
    }).sort({
        createDate: -1
    })
    let reOrganizeRecord = _.chain(indicatorRecords)
        .groupBy((item) => {
            let month = +JSON.stringify(item.createDate).slice(6, 8)
            return month
        })
        .toPairs()
        .map(item => _.zipObject(['month', 'records'], item))
        .value()
    res.status(200).json({
        indicatorRecords: reOrganizeRecord
    })
}
/**
 * get latest record of all indicators
 * @param {*} req 
 * @param {*} res 
 */
let get_latest_record_of_all_indicators = async (req, res) => {

    let _coachee = ""
    let {
        _id,
        userType
    } = req.user;

    if (userType.includes('Coachee')) {
        _coachee = _id
    } else {
        _coachee = req.query.coacheeId
    }
    let latestRecordOfAllIndicators = await IndicatorRecord.aggregate([{
                $match: {
                    $and: [{
                        _coachee: Types.ObjectId(_coachee)
                    }, {
                        isObsolete: false
                    }]

                }
            },
            {
                $sort: {
                    createDate: -1
                }
            },
            {
                $group: {
                    "_id": "$_indicator",
                    "createDate": {
                        $first: "$createDate"
                    },
                    "value": {
                        $first: '$value'
                    },
                    "indicatorRecordId": {
                        $first: "$_id"
                    },
                    "_coachee": {
                        $first: "$_coachee"
                    }

                }
            },
            {
                $lookup: {
                    from: "indicators", //collection'name not model'name
                    localField: "_id",
                    foreignField: "_id",
                    as: "indicators"
                }
            },
            {
                $unwind: {
                    path: "$indicators"
                }
            }
        ])
        .exec()
    let selectedFieldsOfIndicatorRecords = latestRecordOfAllIndicators.reduce((acc, record) => {
        let newIndicatorRecord = {
            name: record.indicators.name,
            group: record.indicators.group,
            value: record.value,
            unit: record.indicators.unit,
            status: "Normal",
            createDate: record.createDate,

        }
        return [...acc, newIndicatorRecord]
    }, [])

    let allIndicators = await Indicator.find({
        isObsolete: false
    })

    let virtualIndicatorRecords = [];

    allIndicators.forEach(item => {
        let virtualIndicatorRecord = {
            name: item.name,
            group: item.group,
            value: '',
            status: "Normal",
            unit: item.unit,
            createDate: ""
        }
        virtualIndicatorRecords.push(virtualIndicatorRecord)
    })

    let deleteRepetitiveIndicatorRecordByName = _.uniqBy([...selectedFieldsOfIndicatorRecords, ...virtualIndicatorRecords], 'name');

    res.status(200).json({
        indicatorRecordByName: deleteRepetitiveIndicatorRecordByName
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_record_by_name_and_pagination = async (req, res) => {
    let _coachee = ""
    let {
        _id,
        userType
    } = req.user;

    let {
        indicatorName: name
    } = req.params;
    let skipNum = parseInt(req.query.skipNum);

    let recordSize = 5;
    if (userType.includes("Coachee")) {
        _coachee = _id
    } else {
        _coachee = req.query.coacheeId
    }
    let _indicator = await Indicator.findOne({
        name
    });

    let onePageRecords = await IndicatorRecord.find({
            $and: [{
                    _coachee: Types.ObjectId(_coachee)
                },
                {
                    isObsolete: false
                },
                {
                    _indicator
                }
            ]
        })
        .sort({
            createDate: -1
        })
        .skip(skipNum)
        .limit(recordSize)
        .populate('_indicator', 'name group unit')


    let selectedFieldsOfIndicatorRecords = onePageRecords.reduce((acc, record) => {
        let newIndicatorRecord = {
            _id: record._id,
            name: record._indicator.name,
            group: record._indicator.group,
            value: record.value,
            unit: record._indicator.unit,
            status: "Normal",
            createDate: record.createDate,

        }
        return [...acc, newIndicatorRecord]
    }, [])
    res.status(200).json({
        onePageRecords: selectedFieldsOfIndicatorRecords
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let update_record_by_id = async (req, res) => {
    let {
        indicatorId
    } = req.params
    let {
        createDate,
        ...otherFields
    } = req.body
    let convertTimeToDateFormat = new Date(createDate);
    let record = await IndicatorRecord.findOneAndUpdate({
        _id: indicatorId
    }, {
        $set: {
            createDate: convertTimeToDateFormat,
            ...otherFields
        }
    }).exec();
    if (!record) throw Error('created wrong')
    res.status(200).json({
        newRecord: record
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let find_latest_record_by_indicator_name = async (req, res) => {
    let _coachee
    let {
        indicatorName: name
    } = req.params;
    let {
        _id,
    } = req.user;
    let {
        coachee
    } = req.query
    let indicatorRecord = {}
    coachee == undefined || null ? _coachee = _id : _coachee = coachee
    if (!_coachee) throw Error("no coachee id")
    let _indicator = await Indicator.findOne({
        name
    })

    let record = await IndicatorRecord.findOne({
            $and: [{
                    _coachee
                },
                {
                    isObsolete: false
                },
                {
                    _indicator
                }
            ]
        })
        .sort({
            createDate: -1
        })

    if (record) {
        indicatorRecord = {
            _id: record._id,
            name: record._indicator.name,
            group: record._indicator.group,
            value: record.value,
            unit: record._indicator.unit,
            status: "Normal",
            createDate: record.createDate,
        }
    } else {
        indicatorRecord = {
            name: _indicator.name,
            group: _indicator.group,
            value: '',
            status: "Normal",
            unit: _indicator.unit,
            createDate: ""
        }
    }

    res.status(200).json({
        indicatorRecord
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */

let insert_multiple_coachees_records = async (req, res) => {
    let {
        records
    } = req.body

    if (!records.length)
        throw new UserFacingError('please add coachees')
    /**
     * check email exist database or not
     */
    let originalEmails = []
    let findCoacheePromises = []
    records.forEach(record => {
        let coacheePromise = Coachee.findOne({
            email: record.email
        })
        findCoacheePromises.push(coacheePromise)
        originalEmails.push(record.email)
    })
    let existingCoachees = await Promise.all(findCoacheePromises)
    let existingEmails = []
    let errString = '';
    existingCoachees.forEach(coachee => {
        if (coachee) {
            existingEmails.push(coachee.email)
        }
    })
    //get no-existed email
    let differenceEmails = []
    differenceEmails = _.difference(originalEmails, existingEmails)
    if (differenceEmails.length > 0) {
        differenceEmails.forEach(email => {
            errString += email;
            errString += '\n';
        })
        throw new UserFacingError(`The following emails do not exist: ${ errString}`);
    }
    // get whole indicators
    let indicators = await Indicator.find().select('_id name')
    let insertRecords = []
    //get all records which will insert
    insertRecords = records.reduce((acc, cuu) => {
        let indicatorRecords = []
        let coachee = existingCoachees.find(coachee => coachee.email == cuu.email)
        cuu['records'].forEach(record => {
            let indicator = indicators.find(indic => indic.name == record.name);
            if (indicator) {
                let indicatorRecord = {
                    _coachee: coachee._id,
                    value: record.value,
                    _indicator: indicator._id,
                    createDate: new Date()

                }
                indicatorRecords.push(indicatorRecord)
            }
        })
        return [...acc, ...indicatorRecords]
    }, [])

    if (insertRecords.length > 0)
        await IndicatorRecord.insertMany(insertRecords)
    /**
     * insert new records
     */

    res.json({
        message: 'insert successfully'
    })
}
module.exports = {
    create_indicator_record,
    get_month_record_by_indicator_name,
    get_year_record_by_indicator_name,
    get_latest_record_of_all_indicators,
    get_record_by_name_and_pagination,
    update_record_by_id,
    find_latest_record_by_indicator_name,
    insert_multiple_coachees_records
}