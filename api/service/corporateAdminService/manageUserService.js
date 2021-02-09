const Models = require('../../models');
const safeAwait = require('safe-await');
const {
    subDays
} = require('date-fns');
const {
    errorHandler
} = require('../../middlewares')
class ManageUserService {
    constructor(corporateAdminService) {
        this.corporateAdminService = corporateAdminService;
    }

    /**
     * 
     * @param {*} membershipCategoryId 
     * @param {*} assigner 
     */
    createMemberTransaction = (user, assigner, assignModel) => {
        return Models['MemberTransaction']
            .create({
                assigner,
                assignerModel: assignModel,
                user,
                userModel: 'Coachee'
            })
    };
    /**
     * get corporate admin by id
     * @param {*} corporateAdminId 
     */
    getCorporateAdminById = (corporateAdminId) => {
        return this.corporateAdminService
            .getDocumentById(corporateAdminId)
            .select('company membersCap membershipExpireAt')
            .populate({
                path: 'company',
                select: '_id'
            })
    };
    /**
     * get users
     */
    getUsers = async (corporateAdminId, queryParams) => {
        let [erradmin, admin] = await safeAwait(this.getCorporateAdminById(corporateAdminId))
        if (erradmin) throw erradmin;
        let {
            filter,
            pageNumber,
            pageSize,
            sortOrder
        } = queryParams
        let numSort = sortOrder == 'asc' ? 1 : -1
        pageSize = parseInt(pageSize) ? parseInt(pageSize) : 20
        if (filter) {
            filter = filter.charAt(0).toUpperCase() + filter.slice(1)
        } else {
            filter = ''
        }
        pageNumber = parseInt(pageNumber) || 0;

        //get users under corporate admin's company

        return Models['Coachee']
            .find({
                $and: [{
                        email: {
                            $regex: filter
                        }
                    },
                    {
                        group: admin.company._id
                    }
                ]
            })
            .sort({
                'email': numSort
            })
            .skip(pageSize * pageNumber)
            .limit(pageSize)
            .populate({
                path: 'company',
                select: '_id companyName'
            })
    }

    /**
     * get total user's numbers
     */

    getTotalNumbersOfUsers = async (corporateAdminId) => {
        let [erradmin, admin] = await safeAwait(this.getCorporateAdminById(corporateAdminId))
        if (erradmin) throw erradmin;
        return Models.Coachee.countDocuments({
            group: admin.company._id
        })
    }
    /**
     * get total ascive user's numbers
     */
    getNumbersOfActiveUsers = async (corporateAdminId) => {
        let [erradmin, admin] = await safeAwait(this.getCorporateAdminById(corporateAdminId))
        if (erradmin) throw erradmin;
        return Models.Coachee.countDocuments({
            $and: [{
                    group: admin.company._id
                },
                {
                    lastTimeLogin: {
                        $gte: subDays(new Date(), 7)
                    }
                }
            ]
        })
    }

    /**
     * create new user
     * @param {*} corporateAdminId 
     * @param {*} userProperties 
     */
    createNewUser = async (corporateAdminId, userProperties) => {
        let coacheePromise = Models['Coachee'].findOne({
            email: userProperties.email
        });
        let coachPromise = Models['Coach'].findOne({
            email: userProperties.email
        });
        let [coachee, coach] = await Promise.all([
            coacheePromise,
            coachPromise,
        ])
        if (coach || coachee) throw new errorHandler.UserFacingError('Email already existed');
        let [erradmin, admin] = await safeAwait(
            this.getCorporateAdminById(corporateAdminId)
        )
        let {
            isMember,
            firstName,
            ...otherUserProperties
        } = userProperties;
        if (isMember === 'Yes') {
            if (admin.membershipExpireAt < new Date()) {
                throw new errorHandler.UserFacingError('membership expired')
            } else {
                let currentMembers = await Models['Coachee']
                    .find({
                        $and: [{
                                group: admin.company._id
                            },
                            {
                                membershipExpireAt: {
                                    $gte: new Date()
                                }
                            }
                        ]
                    })
                if (admin.membersCap < currentMembers) {
                    throw new errorHandler.UserFacingError('members are full')
                } else {
                    let systyemCoach = await Models['Coach']
                        .findOne({
                            email: 'darwina.azmi@proage.sg'
                        })
                        .select('_id');
                    let coachee = await Models['Coachee'].create({
                        group: admin.company,
                        _coach: systyemCoach._id,
                        firstName,
                        password: `${firstName}12345678`,
                        membershipExpireAt: admin.membershipExpireAt,
                        ...otherUserProperties
                    })
                    return this.createMemberTransaction(coachee._id, admin._id, 'CorporateAdmin')
                }
            }
        } else {
            let systyemCoach = await Models['Coach']
                .findOne({
                    email: 'support@uphealth.sg'
                })
                .select('_id');
            return Models['Coachee'].create({
                group: admin.company,
                firstName,
                _coach: systyemCoach._id,
                password: `${firstName}12345678`,
                ...otherUserProperties
            })
        }
    };

    /**
     * 
     * @param {*} id 
     */
    getUserById = (id) => {
        return Models['Coachee'].findById(id)
    }

    /**
     * 
     * @param {*} id 
     */
    updateUserById = async (corporateAdminId, userId, changedProperties) => {
        let [erradmin, admin] = await safeAwait(
            this.getCorporateAdminById(corporateAdminId)
        )
        if (Object.keys(changedProperties).includes('isMember')) {
            let {
                isMember,
                ...otherChangedPropertites
            } = changedProperties
            if (isMember === 'Yes') {
                if (admin.membershipExpireAt < new Date()) {
                    throw new errorHandler.UserFacingError('membership expired')
                } else {
                    let currentMembers = await Models['Coachee']
                        .find({
                            $and: [{
                                    group: admin.company._id
                                },
                                {
                                    membershipExpireAt: {
                                        $gte: new Date()
                                    }
                                }
                            ]
                        })
                    if (admin.memberCap < currentMembers) {
                        throw new errorHandler.UserFacingError('members are full')
                    } else {
                        let coachee = await Models['Coachee']
                            .findById(userId)
                        let assignMembershipPromise = coachee
                            .updateOne({
                                $set: {
                                    membershipExpireAt: admin.membershipExpireAt,
                                    ...otherChangedPropertites
                                }
                            }).exec();
                        let membershipTranstionPromise = this.createMemberTransaction(coachee._id, admin._id, 'CorporateAdmin')
                        return Promise.all([assignMembershipPromise, membershipTranstionPromise])
                    }
                }
            } else {
                return Models['Coachee']
                    .findByIdAndUpdate(userId, {
                        $set: {
                            membershipExpireAt: new Date(),
                            ...otherChangedPropertites
                        }
                    })
            }
        } else {
            return Models['Coachee']
                .findByIdAndUpdate(userId, {
                    $set: {
                        ...changedProperties
                    }
                })
        }

    }

    /**
     * move coachees under a company to individual group
     * @param {*} users 
     */
    moveUserToIndividualGroup = async (userId) => {
        if (!userId) throw new Error('please selected users')
        let companyCode = await Models['CompanyCode']
            .findOne({
                code: "individual"
            })
        if (!companyCode) throw new Error('can not find companyCode')
        return Models['Coachee']
            .findByIdAndUpdate(userId, {
                $set: {
                    group: companyCode._id,
                    membershipExpireAt: new Date()
                }
            })
    }

    batchUploadCoachees = async (corporateAdminId, coachees) => {
        let findCoacheePromises = [];
        if (!coachees.length)
            throw new errorHandler.UserFacingError('please add coachees')
        /**
         * check email exist database or not
         */
        coachees.forEach(coachee => {
            let coacheePromise = Models['Coachee'].findOne({
                email: coachee.email
            }).select('email');
            let coachPromise = Models['Coach'].findOne({
                email: coachee.email
            });
            findCoacheePromises.push(coacheePromise);
            findCoacheePromises.push(coachPromise)
        })
        let existingCoachees = await Promise.all(findCoacheePromises)
        let existingEmails = existingCoachees.filter(existingCoachee => {
            return existingCoachee !== null
        }).map(coachee => {
            return coachee.email
        })
        if (existingEmails.length > 0) {
            let errString = '';
            for (let i = 0; i < existingEmails.length; i++) {
                errString += existingEmails[i] + '\n';
            }
            throw new errorHandler.UserFacingError(`Please remove existed emails: ${ errString}`)
        }
        /**
         * insert new coachees
         */

        let findAdminAndSystemCoachPromise = []
        let findAdminPromise = this.getCorporateAdminById(corporateAdminId)
        let findSystyemCoachPromise = Models['Coach']
            .findOne({
                email: 'support@uphealth.sg'
            })
            .select('_id');

        findAdminAndSystemCoachPromise.push(findAdminPromise);
        findAdminAndSystemCoachPromise.push(findSystyemCoachPromise);
        let [admin, systyemCoach] = await Promise.all(findAdminAndSystemCoachPromise);
        // if admin is not a member
        let insertCoachees = []
        if (new Date(admin.membershipExpireAt) < new Date()) {
            for (let i = 0; i < coachees.length; i++) {
                let coachee = {
                    _coach: systyemCoach._id,
                    password: `${coachees[i].firstName}12345678`,
                    group: admin.company,
                    membershipExpireAt: new Date(),
                    ...coachees[i]
                }
                insertCoachees.push(coachee)
            }
        } else { //admin have membership
            let currentMembers = await Models['Coachee']
                .find({
                    $and: [{
                            group: admin.company
                        },
                        {
                            membershipExpireAt: {
                                $gte: new Date()
                            }
                        }
                    ]
                })
            let insertCoacheeMembers = coachees.filter(coachee => {
                return coachee.isMember == true
            })
            let totalMembers = currentMembers.length + insertCoacheeMembers.length;
            if (totalMembers > admin.membersCap) {
                throw new errorHandler.UserFacingError('members exceed cap')
            }
            for (let i = 0; i < coachees.length; i++) {
                let coachee = {}
                if (coachees[i].isMember) {
                    coachee = {
                        _coach: systyemCoach._id,
                        password: `${coachees[i].firstName}12345678`,
                        group: admin.company,
                        membershipExpireAt: admin.membershipExpireAt,
                        ...coachees[i]
                    }
                } else {
                    coachee = {
                        _coach: systyemCoach._id,
                        password: `${coachees[i].firstName}12345678`,
                        group: admin.company,
                        membershipExpireAt: new Date(),
                        ...coachees[i]
                    }
                }

                insertCoachees.push(coachee)
                console.log('member', insertCoachees)
            }
        }
        if (!insertCoachees.length)
            throw new UserFacingError('create coachees unsuccessfully')
        let insertCoacheePromises = []
        insertCoachees.forEach(newCoachee => {
            let insertCoacheePromise = Models['Coachee'].create(newCoachee)
            insertCoacheePromises.push(insertCoacheePromise)
        })
        await Promise.all(insertCoacheePromises)
        return 'uploaded successfully'
    }
    /**
     * 
     * @param {*} corporateAdminId 
     * @param {*} coachees 
     */
    assignMemberships = async (corporateAdminId, coachees) => {
        if (!coachees.length)
            throw new errorHandler.UserFacingError('please add coachees')
        /**
         * insert new coachees
         */
        let admin = await this.getCorporateAdminById(corporateAdminId)
        // if admin is not a member
        if (new Date(admin.membershipExpireAt) < new Date()) {
            throw new errorHandler.UserFacingError('Upgrade your account to member');
        } else { //admin have membership
            let currentMembers = await Models['Coachee']
                .find({
                    $and: [{
                            group: admin.company
                        },
                        {
                            membershipExpireAt: {
                                $gte: new Date()
                            }
                        }
                    ]
                })
            let totalMembers = currentMembers.length + coachees.length;
            if (totalMembers > admin.membersCap) {
                throw new errorHandler.UserFacingError('members exceed cap')
            } else {
                let updateMembershipPromises = []
                for (let i = 0; i < coachees.length; i++) {
                    let updateMembershipPromise = Models['Coachee']
                        .findByIdAndUpdate(coachees[i], {
                            $set: {
                                membershipExpireAt: admin.membershipExpireAt
                            }
                        })
                    updateMembershipPromises.push(updateMembershipPromise)
                }
                await Promise.all(updateMembershipPromises);
                return 'uploaded successfully'
            }
        }
    }
}

module.exports = ManageUserService