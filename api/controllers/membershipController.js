'use strict'
const {
    Membership,
    MembershipCategory,
    Coachee
} = require('../models')


/**
 * get all memberships 
 * @param {*} req 
 * @param {*} res 
 */
let get_memberships = async (req, res) => {
    let queryParams = req.query
    let filter = ""
    let pageSize = 3
    let numSort = -1
    let memberships = []
    let {
        sortOrder
    } = queryParams;
    filter = queryParams.filter
    numSort = sortOrder == 'asc' ? 1 : -1
    pageSize = parseInt(queryParams.pageSize)
    let pageNumber = parseInt(queryParams.pageNumber) || 0

    try {
        memberships = await Membership.aggregate([{
                $lookup: {
                    from: "coachees",
                    localField: "_coachee",
                    foreignField: "_id",
                    as: "coachee"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_membershipCategory",
                    foreignField: "_id",
                    as: "membershipCategory"
                }
            },
            {
                $unwind: {
                    path: "$coachee"
                },

            },
            {
                $unwind: {
                    path: "$membershipCategory"
                },

            },
            {
                $match: {
                    'coachee.email': {
                        $regex: filter
                    }
                }
            },
            {
                $skip: (pageNumber * pageSize)
            },
            {
                $limit: (pageSize)
            },
            {
                $sort: {
                    "createdDate":numSort
                }
            },
            {
                $project: {
                    '_id': 1,
                    'createdAt':1,
                    'coachee.firstName': 1,
                    'coachee.lastName': 1,
                    'coachee.email': 1,
                    'membershipCategory.duration': 1,
                    'membershipCategory.name': 1
                }
            },

        ])
        res.status(200).json({
            memberships
        })
    } catch (error) {
        throw new Error('get memberships error')
    }
};

/**
 * get total membership numbers
 */

let get_membership_total_numbers = async (req, res) => {
    let numMemberships = 0;
    numMemberships = await Membership.estimatedDocumentCount()
    res.status(200).json({
        numMemberships
    })
}
/**
 * create new comment 
 * @params {req.params}
 *          {req.body}
 * @returns string
 */
module.exports = {
    get_memberships,
    get_membership_total_numbers 
}