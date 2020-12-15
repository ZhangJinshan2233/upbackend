const {
    memberService
} = require('../service')
const safeAwait = require('safe-await');

module.exports = () => {
    const memberController = {}
    memberController.createDocument = async (req, res) => {
        let {
            _id: assigner,
            userType: assignerModel
        } = req.user;
        const properties = {};
        Object.assign(properties, {
            assigner: assigner,
            assignerModel: assignerModel
        }, req.body)
        let [err, messages] = await safeAwait(memberService
            .createDocument(properties));
        if (err) throw err
        res.status(200).json({
            message: 'created successfully'
        })
    }

    memberController.getMemberRecordByUserId  = async (req, res) => {
        let [err, memberRecord] = await safeAwait(memberService
            .getMemberRecordByUserId (req.user._id))
        if (err) throw err
        res.status(200).json({
            memberRecord
        })
    }

    memberController.getMemberTransactionNumbers = async (req, res) => {
        let [err, memberTransactionNumbers] = await safeAwait(memberService
            .getMemberTransactionNumbers())
        if (err) throw err
        res.status(200).json({
            memberTransactionNumbers
        })
    }

    memberController.getMemberTransactions = async (req, res) => {
        let [err, memberTransactions] = await safeAwait(memberService
            .getMemberTransactions(req.query))

        if (err) throw err
        return res.status(200).json({
            memberTransactions
        })
    }
    return memberController
}