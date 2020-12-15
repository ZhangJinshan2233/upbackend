const {
    Coachee,
    Coach,
    CompanyCode,
    IndicatorRecord,
    Indicator,
    MemberRecord
} = require('../models');
const _h = require('../helpers');
const _ = require('lodash');
const {
    Types
} = require('mongoose')
const {
    UserFacingError
} = require('../middlewares').errorHandler
/**
 * @function register
 * @public
 * @param {req.body} :email,password,first_name,last_name.
 * @returns string.
 */

let signup = async (req, res) => {
    let {
        email,
        firstName,
        companyCode,
        weight,
        ...otherProperties
    } = req.body
    let code = companyCode || 'individual'
    let group = "";
    let companyInfo = await CompanyCode.findOne({
        code
    });
    if (!companyInfo) throw new UserFacingError('company code does not exist');
    let coacheePromise = Coachee.findOne({
        email: email
    });
    let coachPromise = Coach.findOne({
        email: email
    });
    group = companyInfo._id;
    let systyemCoachPromise = Coach
        .findOne({
            email: 'support@uphealth.sg'
        })
        .select('_id');
    let [coachee, coach, systyemCoach] = await Promise.all([
        coacheePromise,
        coachPromise,
        systyemCoachPromise
    ])

    if (coach || coachee) throw new UserFacingError('Email already existed');

    let newUser = await Coachee.create({
        _coach: systyemCoach._id,
        group,
        email,
        firstName,
        weight,
        ...otherProperties
    });
    if (parseInt(weight) > 20) {
        let weightIndicator = await Indicator
            .findOne({
                name: 'Weight'
            })
            .select('_id');
        await IndicatorRecord.create({
            _coachee: newUser._id,
            value: weight,
            _indicator: weightIndicator._id,
            createDate: new Date()
        })
    }
    if (newUser)
        _h.send_welcome_email(email, firstName);
    return res.status(200).json({
        newUser
    })

};


/**
 * find coach by id
 * @param {coachee id} req 
 * @param {*} res 
 */
let get_coachee_by_coacheeId = async (req, res) => {
    let coachee = {}
    let {
        coacheeId: _id
    } = req.params
    coachee = await Coachee.findById(_id)
    if (!coachee) throw Error('can not find')
    //prevent theRestOfPropertiesCoach passing parent class of coach object
    let deserializationCoachee = JSON.parse(JSON.stringify(coachee))
    res.status(200).json({
        coachee: deserializationCoachee
    })
}

/**
 * admin get coachees
 * @param {*} req 
 * @param {*} res 
 */
let get_coachees_pagination = async (req, res) => {
    console.log('sortField'.sortField)
    let queryParams = req.query
    let {
        sortField,
        sortOrder,
        filterValue,
        filterField,
    } = queryParams;
    switch (true) {
        case (filterField == 'group'):
            field = 'group.companyName'
            break;
        case (filterField == 'email'):
            field = 'email'
            break;
        default:
            field = 'email'
            break
    }
    if (!sortField) {
        sortField = 'email'
    }
    let numSort = sortOrder == 'desc' ? -1 : 1
    let pageSize = parseInt(queryParams.pageSize)
    let pageNumber = parseInt(queryParams.pageNumber) || 0
    let coachees = [];
    try {
        coachees = await Coachee.aggregate([{
                $lookup: {
                    from: "coaches",
                    localField: "_coach",
                    foreignField: "_id",
                    as: "coach"
                }
            },
            {
                $lookup: {
                    from: "companycodes",
                    localField: "group",
                    foreignField: "_id",
                    as: "group"
                }
            },
            {
                $unwind: {
                    path: "$coach"
                },

            },
            {
                $unwind: {
                    path: "$group"
                },

            },
            {
                $match: {
                    [field]: {
                        $regex: filterValue
                    }
                }
            },
            {
                $sort: {
                    [sortField]: numSort
                }
            },
            {
                $skip: (pageNumber * pageSize)
            },

            {
                $limit: (pageSize)
            },
            {
                $project: {
                    '_id': 1,
                    'createdAt': 1,
                    'firstName': 1,
                    'lastName': 1,
                    'email': 1,
                    'coach.email': 1,
                    'group.companyName': 1
                }
            }
        ])
        let memberRecordPromises = []
        let memberRecords = []
        let combinedCochees = []
        if (coachees.length > 0) {
            for (coachee of coachees) {
                let memberRecordPromise = MemberRecord.findOne({
                    user: coachee._id
                })
                memberRecordPromises.push(memberRecordPromise)
            }

            memberRecords = await Promise.all(memberRecordPromises)

        }

        let filteredMemberRecords = memberRecords.filter((memberRecord) => {
            return memberRecord != null
        })
        if (filteredMemberRecords.length > 0) {
            combinedCochees = coachees.reduce((accmulator, current) => {
                let combinedCochee = {
                    memberStatus: false,
                    expireAt: null,
                    ...JSON.parse(JSON.stringify(current))
                }
                for (memberRecord of filteredMemberRecords) {
                    if (current._id.toString() == memberRecord.user.toString()) {
                        combinedCochee.expireAt = memberRecord.expireAt
                        combinedCochee.memberStatus = true
                    }
                    continue
                }
                return [...accmulator, combinedCochee]
            }, [])
        } else {
            combinedCochees = coachees.map((coachee) => {
                return {
                    expireAt: null,
                    memberStatus: false,
                    ...JSON.parse(JSON.stringify(coachee))
                }
            })
        }
        res.status(200).json({
            coachees: combinedCochees
        })

    } catch (error) {
        console.log(error)
        throw new Error('get coachees error')
    }
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_coachee_total_numbers = async (req, res) => {

    let numCoachees = 0
    try {
        numCoachees = await Coachee.estimatedDocumentCount()
    } catch (error) {
        throw new Error('internal error')
    }

    res.status(200).json({
        numCoachees
    })

}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let assign_coach = async (req, res) => {
    let {
        coachees,
        coachId
    } = req.body
    if (!coachees.length) throw new UserFacingError('please selected coachee')
    let coacheeUpdatePromises = []
    let coach = await Coach.findById(Types.ObjectId(coachId))
    if (!coach) throw Error('can not find coach')
    for (let coachee of coachees) {
        let coacheeUpdatePromise = Coachee.findByIdAndUpdate(coachee, {
            $set: {
                _coach: coach._id
            }
        })
        coacheeUpdatePromises.push(coacheeUpdatePromise)
    }
    let coacheesResult = await Promise.all(coacheeUpdatePromises)
    if (coacheesResult.length < 0) throw Error('assign unsuccessfully')
    res.status(200).json({
        message: "assign successfully"
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let assign_group = async (req, res) => {
    let {
        coachees,
        companyCodeId
    } = req.body
    if (!coachees.length) throw new Error('please selected coachee')
    let coacheeUpdatePromises = []
    let companyCode = await CompanyCode.findById(Types.ObjectId(companyCodeId))
    if (!companyCode) throw new Error('can not find coach')
    for (let coachee of coachees) {
        let coacheeUpdatePromise = Coachee.findByIdAndUpdate(coachee, {
            $set: {
                group: companyCode._id
            }
        })
        coacheeUpdatePromises.push(coacheeUpdatePromise)
    }
    let coacheesResult = await Promise.all(coacheeUpdatePromises)
    if (coacheesResult.length < 0) throw new UserFacingError('assign unsuccessfully')
    res.status(200).json({
        message: "assign successfully"
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let multiple_signup = async (req, res) => {
    let {
        coachees
    } = req.body
    let findCoacheePromises = [];
    if (!coachees.length)
        throw new UserFacingError('please add coachees')
    /**
     * check email exist database or not
     */
    coachees.forEach(coachee => {
        coacheePromise = Coachee.findOne({
            email: coachee.email
        }).select('email')
        findCoacheePromises.push(coacheePromise)
    })
    let existingCoachees = await Promise.all(findCoacheePromises)
    let existingEmails = []
    let errString = '';
    existingCoachees.forEach(coachee => {
        if (coachee) {
            existingEmails.push(coachee.email)
            errString += coachee.email;
            errString += '\n';
        }
    })

    if (existingEmails.length > 0)
        throw new UserFacingError(`The following emails existed: ${ errString}`)
    /**
     * insert new coachees
     */
    let systyemCoach = await Coach
        .findOne({
            email: 'support@uphealth.sg'
        })
        .select('_id');
    // assign coach
    let coacheesAssignedCoach = []
    let companyInfos = await CompanyCode.find()
        .select('_id companyName')
    for (let i = 0; i < coachees.length; i++) {
        let companyInfo = companyInfos.find(info => info.companyName === coachees[i].companyName)
        if (!companyInfo)
            throw new UserFacingError(`This company name\"${coachees[i].companyName}\" do not match`);
        let coachee = {
            _coach: systyemCoach._id,
            password: coachees[i].firstName + 12345678,
            group: companyInfo._id,
            ...coachees[i]
        }
        coacheesAssignedCoach.push(coachee)
    }
    if (!coacheesAssignedCoach.length)
        throw new UserFacingError('create coachees unsuccessfully')
    let insertCoacheePromises = []
    coacheesAssignedCoach.forEach(newCoachee => {
        let insertCoacheePromise = Coachee.create(newCoachee)
        insertCoacheePromises.push(insertCoacheePromise)
    })
    await Promise.all(insertCoacheePromises)
    //send emails
    // try {
    //     await Promise.all(_h.send_multiple_welcome_email(insertedResults))
    // } catch (err) {}
    res.json({
        message: "insert successfully"
    })
}
module.exports = {
    signup,
    get_coachees_pagination,
    get_coachee_total_numbers,
    get_coachee_by_coacheeId,
    assign_coach,
    assign_group,
    multiple_signup
}