const Models = require('../../models');
const {
    Types
} = require('mongoose')
const {
    addDays
} = require('date-fns');

class CreateDocumentProcessor {
    constructor(userType) {
        this.userType = userType;
        this.userModel = userType.charAt(0).toUpperCase() + userType.slice(1)
    }
    /**
     * 
     * @param {*} userId 
     */
    updateMemberStatus = (userId) => {
        return Models[this.userModel]
            .findByIdAndUpdate(userId, {
                $set: {
                    isMember: true
                }
            })
    };
    /**
     * 
     * @param {*} membershipCategoryId 
     * @param {*} assigner 
     */
    createMemberTransaction = (membershipCategoryId, user, assigner, assignModel) => {
        return Models['MemberTransaction']
            .create({
                _membershipCategory: membershipCategoryId,
                assigner,
                assignerModel: assignModel,
                user,
                userModel: this.userModel
            })
    };
    /**
     * 
     * @param {*} user 
     */
    findMemberRecord = async (user) => {
        return Models['MemberRecord']
            .findOne({
                user: Types.ObjectId(user)
            })
    };

    /**
     * 
     * @param {*} duration 
     */
    updateMemberRecord = (memberReocrd, duration) => {
        let expireDate = addDays(new Date(memberReocrd.expireAt), duration)
        return memberReocrd
            .updateOne({
                $set: {
                    expireAt: expireDate
                }
            })
    };

    /**
     * 
     * @param {*} user 
     * @param {*} duration 
     */
    createMemberRecord = (user, duration) => {
        return Models['MemberRecord']
            .create({
                user,
                userModel: this.userModel,
                expireAt: addDays(Date.now(), duration)
            })
    }
}

module.exports = () => {
    const memberService = {}
    memberService.createDocument = async (properties) => {
        let {
            userType,
            membershipCategoryId,
            users,
            assigner,
            assignerModel
        } = properties;
        if (!membershipCategoryId || !users.length)
            throw new Error('less information');
        let assignMemberPromises = []
        const memberCategory = await Models
            .MembershipCategory
            .findById(membershipCategoryId)
        const createMemberProcessor = new CreateDocumentProcessor(userType)
        //check how many users have member recoed
        let memberRecordsPromises = []
        for (let user of users) {
            memberRecordsPromise = createMemberProcessor
                .findMemberRecord(user);
            memberRecordsPromises.push(memberRecordsPromise)
        }

        let memberRecords = (await Promise.all(memberRecordsPromises))
            .filter(memberRecord => {
                return memberRecord
            });
        for (let user of users) {
            if (memberRecords.length > 0) { //some users have member records
                let haveRecord = memberRecords.find(memberRecord => {
                    return memberRecord.user == user
                })
                if (haveRecord) { //find user have member record
                    let memberRecordPromise = createMemberProcessor
                        .updateMemberRecord(haveRecord, memberCategory.duration);
                    assignMemberPromises.push(memberRecordPromise)
                } else {
                    let memberRecordPromise = createMemberProcessor
                        .createMemberRecord(user, memberCategory.duration);
                    assignMemberPromises.push(memberRecordPromise);
                    let updateMemberStatusPromise = createMemberProcessor
                        .updateMemberStatus(user);
                    assignMemberPromises.push(updateMemberStatusPromise)
                }
            } else {
                let memberRecordPromise = createMemberProcessor
                    .createMemberRecord(user, memberCategory.duration);
                assignMemberPromises.push(memberRecordPromise);
                let updateMemberStatusPromise = createMemberProcessor
                    .updateMemberStatus(user);
                assignMemberPromises.push(updateMemberStatusPromise)
            }
            let assignMemberTransactionPromise = createMemberProcessor
                .createMemberTransaction(membershipCategoryId, user, assigner, assignerModel);
            assignMemberPromises.push(assignMemberTransactionPromise);
        }
        return Promise.all(assignMemberPromises)
    }

    /**
     * find member by coachee id
     * @param {*} coacheeId 
     */
    memberService.getMemberRecordByUserId = async (userId) => {
        return Models['MemberRecord'].findOne({
            $and: [{
                user: Types.ObjectId(userId)
            }, {
                isObsolete: false
            }]
        })
    }

    /**
     * get Member Transactions
     * @param {*} req 
     * @param {*} res 
     */
    memberService.getMemberTransactions = async (queryParams) => {
        let {
            sortOrder,
            pageSize,
            pageNumber,
            filter: filterField
        } = queryParams;
        let numSort = sortOrder == 'asc' ? 1 : -1
        pageSize = parseInt(pageSize) || 10
        pageNumber = parseInt(pageNumber) || 0;
        let memberTransactions = []
        try {
            memberTransactions = await Models['MemberTransaction']
                .find()
                .sort({
                    createdAt: numSort
                })
                .skip(pageNumber * pageSize)
                .limit(pageSize)
                .populate({
                    path: 'user',
                    select: 'email firstName lastName',
                })
                .populate({
                    path: '_membershipCategory',
                    select: 'name duration',
                })
                .populate({
                    path: 'assigner',
                    select: 'email firstName lastName',
                })
            let filterMemberTransactions = []
            if (filterField.length > 0 && memberTransactions.length > 0) {
                filterMemberTransactions = memberTransactions.filter(memberTransaction => {
                    return memberTransaction.user.email.includes(filterField)
                })
            } else {
                filterMemberTransactions = memberTransactions
            }
            return filterMemberTransactions

        } catch (error) {
            console.log(error)
            throw new Error('get memberships error')
        }
    };

    /**
     * get total transaction numbers
     */

    memberService.getMemberTransactionNumbers = () => {
        return Models['MemberTransaction']
            .countDocuments()
    }

    return memberService
}