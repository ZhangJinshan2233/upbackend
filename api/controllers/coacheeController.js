const {
    Coachee,
    Coach,
    HabitCategory,
    Habit,
    MemberRecord,
    CompanyCode,
    IndicatorRecord,
    Indicator
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
    let group = ""
    let coacheePromise = Coachee.findOne({
        email: email
    });
    let coachPromise = Coach.findOne({
        email: email
    });


    let companyInfo = await CompanyCode.findOne({
        code
    });

    if (!companyInfo) throw new UserFacingError('company code does not exist')
    group = companyInfo._id;

    let systyemCoachPromise = Coach
        .findOne({
            email: 'support@uphealth.sg'
        })
        .select('_id');

    let weightIndicatorPromise = Indicator
        .findOne({
            name: 'Weight'
        })
        .select('_id');

    let [coachee, coach, systyemCoach, weightIndicator] = await Promise.all([
        coacheePromise,
        coachPromise,
        systyemCoachPromise,
        weightIndicatorPromise
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
    await IndicatorRecord.create({
        _coachee: newUser._id,
        value: weight,
        _indicator: weightIndicator._id,
        createDate: new Date()
    })
    if (newUser)
        _h.send_welcome_email(email, firstName);
    return res.status(200).json({
        newUser
    })

};

/**
 * @function create new habit of coachee
 * @param {*} req 
 * @param {*} res 
 */
let insert_recommended_habits = async (req, res) => {
    let {
        _id
    } = req.user;
    let randomHabits = []
    //group habit categories by group name
    let groupHabitCategories = await HabitCategory
        .aggregate([{
                $match: {
                    isObsolete: false
                }
            },
            {
                $group: {
                    "_id": "$group",
                    habits: {
                        "$addToSet": {
                            "name": "$name",
                            "description": "$description",
                            "isObsolete": "$isObsolete"
                        }


                    }
                }
            }
        ]).exec();

    //recommend one random habit from each group

    for (let i in groupHabitCategories) {

        randomHabits.push(_.sampleSize(groupHabitCategories[i].habits));

    }
    let recommendHabitlist = _.flatten(randomHabits);

    //insert recommendHabitList into day of the week

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    //habit list of day of week
    let habits = recommendHabitlist.reduce((accmulator, current) => {
        let habit = {
            ...current,
            _coachee: _id,
            daysOfWeek: daysOfWeek
        };
        return [...accmulator, habit]
    }, [])

    let insertedHabitlist = await Habit.insertMany(habits)
    if (!insertedHabitlist.length) throw Error('insert unsuccessfully')

    res.status(200).json({
        message: "insert successfully"

    })
}
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
    let {
        imgData,
        ...theRestOfPropertiesCoachee
    } = deserializationCoachee
    let coacheeImgData = ""
    if (imgData) {
        coacheeImgData = Buffer.from(imgData).toString('base64')
    }
    currentCoachee = {
        imgData: coacheeImgData,
        ...theRestOfPropertiesCoachee
    }
    res.status(200).json({
        coachee: currentCoachee
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
                    _coachee: coachee._id
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
                    if (current._id.toString() == memberRecord._coachee.toString()) {
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
    let systyemCoachPromise = Coach
        .findOne({
            email: 'support@uphealth.sg'
        })
        .select('_id');

    let weightIndicatorPromise = Indicator
        .findOne({
            name: 'Weight'
        })
        .select('_id');

    let [systyemCoach, weightIndicator] = await Promise.all([
        systyemCoachPromise,
        weightIndicatorPromise
    ])
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
            password: coachees[i].phoneNumber.toString(),
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
    let insertedResults = await Promise.all(insertCoacheePromises)
    //insert weight records
    let weightRecords = [];
    insertedResults.forEach(coachee => {
        let weightRecord = {
            _coachee: coachee._id,
            value: coachee.weight,
            _indicator: weightIndicator._id,
            createDate: new Date()
        }
        weightRecords.push(weightRecord)
    })

    await IndicatorRecord.insertMany(weightRecords)
    //send emails
    try {
        await Promise.all(_h.send_multiple_welcome_email(insertedResults))
    } catch (err) {}
    res.json({
        message: "insert successfully"
    })
}
module.exports = {
    signup,
    insert_recommended_habits,
    get_coachees_pagination,
    get_coachee_total_numbers,
    get_coachee_by_coacheeId,
    assign_coach,
    assign_group,
    multiple_signup
}