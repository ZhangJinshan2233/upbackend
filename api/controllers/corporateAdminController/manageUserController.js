const safeAwait = require('safe-await');
class ManageUsersController {
    constructor(service) {
        this.service = service
    }
    /**
     * get users
     */
    getUsers = async (req, res) => {
        console.log(req.query)
        let [err, documents] = await safeAwait(
            this.service.getUsers(req.user._id, req.query))
        if (err) throw err
        res.status(200).json({
            documents
        })
    }

    /**
     * get total users
     * @param {*} req 
     * @param {*} res 
     */
    getTotalNumbersOfUsers = async (req, res) => {
        let [err, documentNumbers] = await safeAwait(
            this.service.getTotalNumbersOfUsers(req.user._id))
        if (err) throw err
        res.status(200).json({
            documentNumbers
        })
    };
    /**
     * get total ascive user's numbers
     */
    getNumbersOfActiveUsers = async (req, res) => {
        let [err, activeDocumentNumbers] = await safeAwait(
            this.service.getNumbersOfActiveUsers(req.user._id))
        if (err) throw err
        res.status(200).json({
            activeDocumentNumbers
        })
    }

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     */
    createNewUser = async (req, res) => {
        let [err, document] = await safeAwait(
            this.service.createNewUser(req.user._id, req.body))
        if (err) throw err
        res.status(200).json({
            message: 'create successfully'
        })
    }

    getUserById = async (req, res) => {
        let [err, document] = await safeAwait(
            this.service.getUserById(req.params.id))
        if (err) throw err
        res.status(200).json({
            document
        })
    }

    updateUserById = async (req, res) => {
        let [err, message] = await safeAwait(
            this.service.updateUserById(req.user._id, req.params.id, req.body)
        )
        if (err) throw err
        res.status(200).json({
            message
        })
    }

    moveUserToIndividualGroup = async (req, res) => {
        let [err, message] = await safeAwait(
            this.service.moveUserToIndividualGroup(req.body)
        )
        if (err) throw err
        res.status(200).json({
            message
        })
    }

    batchUploadCoachees = async (req, res) => {
        let [err, message] = await safeAwait(
            this.service.batchUploadCoachees(req.user._id, req.body)
        )
        if (err) throw err
        res.status(200).json({
            message
        })
    }

    assignMemberships = async (req, res) => {
        let [err, message] = await safeAwait(
            this.service.assignMemberships(req.user._id, req.body)
        )
        if (err) throw err
        res.status(200).json({
            message
        })
    }
}
module.exports = ManageUsersController