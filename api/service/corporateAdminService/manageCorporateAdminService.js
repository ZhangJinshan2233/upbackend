const Service = require('../Service');
const Models = require('../../models');
const bcrypt = require('bcrypt');
const {
    addDays
} = require('date-fns')
const {
    errorHandler
} = require('../../middlewares')

const _h = require('../../helpers')
const {
    Types
} = require('mongoose');

const safeAwait = require('safe-await');

class ManageCorporateAdminService extends Service {
    constructor(modelName, uploadOptions) {
        super(modelName, uploadOptions)
        this.modelName = modelName;
    }
    /**
     * get all documents based on different conditions
     * @param {*} queryParams 
     */
    getAllDocuments = (queryParams) => {
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
        return Models[this.modelName]
            .find({
                email: {
                    $regex: filter
                }
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
    };

    /**
     * assign company code to corporate admins
     * @param {*} corporateAdmins 
     */
    assignCompanyCode = async (corporateAdmins, companyCodeId) => {
        if (!corporateAdmins.length) throw new Error('please selected users')
        let corporateAdminUpdatePromises = []
        let companyCode = await Models['CompanyCode']
            .findById(Types.ObjectId(companyCodeId))
        if (!companyCode) throw new Error('can not find companyCode')
        for (let corporateAdmin of corporateAdmins) {
            let corporateAdminUpdatePromise = this.updateDocumentById(corporateAdmin, {
                company: companyCode._id
            })
            corporateAdminUpdatePromises.push(corporateAdminUpdatePromise)
        }
        return Promise.all(corporateAdminUpdatePromises)
    }

    assignMembership = async (corporateAdmins, membershipCategory) => {
        if (!corporateAdmins.length)
            throw new Error('please selected coachee');
        let corporateAdminPromises = [];
        let assignMembershipPromises = []
        let corporateAdminDocuments = [];
        for (let corporateAdmin of corporateAdmins) {
            let corporateAdminPromise = this.getDocumentById(corporateAdmin)
                .select('membershipExpireAt')
            corporateAdminPromises.push(corporateAdminPromise);
        }
        corporateAdminDocuments = await Promise.all(corporateAdminPromises)
        for (let corporateAdminDocument of corporateAdminDocuments) {
            let expireDate;
            if (corporateAdminDocument.membershipExpireAt > new Date()) {
                expireDate = addDays(new Date(corporateAdminDocument.membershipExpireAt), membershipCategory.duration)
            } else {
                expireDate = addDays(new Date(), membershipCategory.duration)
            }
            let assignMembershipPromise = corporateAdminDocument.updateOne({
                $set: {
                    membershipExpireAt: expireDate
                }
            }).exec();
            assignMembershipPromises.push(assignMembershipPromise);
        }
        return Promise.all(assignMembershipPromises)
    }
    /**
     * corporate admin sign in
     * @param {*} email 
     * @param {*} password 
     */
    signin = async (confidentialInfo) => {
        let {
            email,
            password
        } = confidentialInfo
        let isMatch = false;
        let corporateAdmin = await Models[this.modelName].findOne({
            email: email
        })
        if (!corporateAdmin) {
            throw new errorHandler.UserFacingError('The user ID and password don\'t match.');
        }

        isMatch = await corporateAdmin.comparePassword(password);

        if (!isMatch) throw new errorHandler.UserFacingError('The user ID and password don\'t match.');
        return _h.create_token(corporateAdmin)
    }

    /**
     * get corporate admin infos
     */
    getUserProfile = (_id) => {
        return this.getDocumentById(_id)
            .populate({
                path: 'company',
                select: 'companyName'
            })
            .select('firstName lastName membersCap email company phoneNumber')
    }
    /**
     * change password
     */
    changePassword = async (_id, passwordProperties) => {
        let {
            currentPassword,
            newPassword
        } = passwordProperties
        let isMatch = false;
        let [erradmin, admin] = await safeAwait(this.getDocumentById(_id))
        if (erradmin) throw erradmin
        isMatch = await admin.comparePassword(currentPassword)
        if (!isMatch) throw new errorHandler.UserFacingError('The user ID and password don\'t match.');
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(newPassword, salt);
        return this.updateDocumentById(_id, {
            password: hash
        })
    }

};


module.exports = ManageCorporateAdminService