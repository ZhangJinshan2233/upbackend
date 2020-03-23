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
const {UserFacingError} = require('../middlewares').errorHandler
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

    // let memberCategoryPromise = MembershipCategory.findOne({
    //     name: 'Trial'
    // })
    // let newUserAndMemberCategory = await Promise.all([newUserPromise, memberCategoryPromise])
    // let newUser = newUserAndMemberCategory[0];
    // let memberCategory = newUserAndMemberCategory[1]
    // if (!newUser) throw Error('created unsuccessfully')
    // let newMembership = await Membership.create({
    //     _coachee: newUser._id,
    //     _membershipCategory: memberCategory._id
    // });

    // if (!newMembership) throw Error('failed to register');

    // let memberRecord = await MemberRecord.create({
    //     _coachee: newUser._id,
    //     memberships: [{
    //         _membership: newMembership._id
    //     }],
    //     expireAt: addDays(new Date(), memberCategory.duration)
    // })
    // if (!memberRecord) throw Error('failed to register');

    await IndicatorRecord.create({
        _coachee: newUser._id,
        value: weight,
        _indicator: weightIndicator._id,
        createDate: new Date()
    })

    let emailContent = "Welcome to the UP Health community. " +
        "You'll find no where like this where great place where" +
        " friendships meet professional coaching so that becoming " +
        "healthy becomes more fun and desirable. " +
        "We can't wait for you to join us and work " +
        "toward achieving your health goals together."

    let subjectData = "Registration from UP";
    let htmlData =
        "<html>Hey " + firstName + ",<br/><br/>" + emailContent + "<br/><br/><Table><TR ALIGN='Left'><TD><a href='http://www.uphealth.sg'><img src='http://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/88884/145502_842983.png' height='150' alt='UP logo'></a></TD><TD>Cheering you on,<br>UP Welcome Team <br>T: (+65) 6743 4010<br>W: uphealth.sg <br><br><b><i>UP your health, UP your life!</b></i></TD></TR></Table><br></html>";
    if (newUser)
        _h.send_welcome_email(email, subjectData, htmlData);
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

// let get_coachees_pagination = async (req, res) => {
//     let queryParams = req.query
//     let {
//         sortField,
//         sortOrder,
//         filter
//     } = queryParams;
//     let numSort = sortOrder == 'desc' ? -1 : 1
//     let pageSize = parseInt(queryParams.pageSize)
//     let pageNumber = parseInt(queryParams.pageNumber) || 0
//     let coachees = [];
//     try {
//         coachees = await Coachee
//             .find({
//                 email: {
//                     $regex: filter
//                 }
//             })
//             .sort({
//                 [sortField]: numSort
//             })
//             .skip(pageSize * pageNumber)
//             .limit(pageSize)
//             .select('email firstName lastName _coach isMember group createdAt')
//             .populate({
//                 path: '_coach',
//                 select: 'email firstName lastName'
//             })
//             .populate({
//                 path: 'group',
//                 select: 'companyName'
//             })
//         let memberRecordPromises = []
//         let memberRecords = []
//         let combinedCochees = []
//         if (coachees.length > 0) {
//             for (coachee of coachees) {
//                 let memberRecordPromise = MemberRecord.findOne({
//                     _coachee: coachee._id
//                 })
//                 memberRecordPromises.push(memberRecordPromise)
//             }

//             memberRecords = await Promise.all(memberRecordPromises)

//         }

//         let filteredMemberRecords = memberRecords.filter((memberRecord) => {
//             return memberRecord != null
//         })
//         if (filteredMemberRecords.length > 0) {
//             combinedCochees = coachees.reduce((accmulator, current) => {
//                 let combinedCochee = {
//                     memberStatus: false,
//                     expireAt: null,
//                     ...JSON.parse(JSON.stringify(current))
//                 }
//                 for (memberRecord of filteredMemberRecords) {
//                     if (current._id.toString() == memberRecord._coachee.toString()) {
//                         combinedCochee.expireAt = memberRecord.expireAt
//                         combinedCochee.memberStatus = true
//                     }
//                     continue
//                 }
//                 return [...accmulator, combinedCochee]
//             }, [])
//         } else {
//             combinedCochees = coachees.map((coachee) => {
//                 return {
//                     expireAt: null,
//                     memberStatus: false,
//                     ...JSON.parse(JSON.stringify(coachee))
//                 }
//             })
//         }
//         res.status(200).json({
//             coachees: combinedCochees
//         })

//     } catch (error) {
//         throw new Error('get coachees error')
//     }
// }

let get_coachees_pagination = async (req, res) => {
    let queryParams = req.query
    let {
        sortField,
        sortOrder,
        filterValue,
        filterField,
    } = queryParams;
    switch (true) {
        case (filterField == 'coach'):
            field = 'coach.email';
            break;
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
module.exports = {
    signup,
    insert_recommended_habits,
    get_coachees_pagination,
    get_coachee_total_numbers,
    get_coachee_by_coacheeId,
    assign_coach,
    assign_group
}