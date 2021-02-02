const {
    manageCorporateAdminService
} = require('../../service');
const Controller = require('../Controller');
const safeAwait = require('safe-await');
class ManageCorporateAdminController extends Controller {
    constructor(service) {
        super(service)
        this.service = service
    }
    /**
     * assign company code to corporat admins 
     * @param {*} req 
     * @param {*} res 
     */
    assignCompanyCode = async (req, res) => {
        let [err, message] = await safeAwait(this.service.assignCompanyCode(req.body.corporateAdmins, req.body.companyCodeId))
        if (err) throw err
        res.status(200).json({
            message: "assign successfully"
        })
    }

    /**
     * corporate admin sign in
     * @param {*} req 
     * @param {*} res 
     */
    signin = async (req, res) => {
        let [err, access_token] = await safeAwait(this.service.signin(req.body))
        if (err) throw err
        res.status(200).json({
            access_token
        })
    }

    updateProfile = async (req, res) => {
        let [err, document] = await safeAwait(
            this.service.updateDocumentById(req.user._id, req.body))
        if (err) throw err;
        res.status(200).json({
            message: 'updated successfully'
        })
    }
    /**
     * get corporate admin infos
     * @param {*} req 
     * @param {*} res 
     */
    getUserProfile = async (req, res) => {
        let [err, document] = await safeAwait(
            this.service.getUserProfile(req.user._id))
        if (err) throw err
        res.status(200).json({
            document
        })
    }
    /**
     * change password
     */
    changePassword = async (req, res) => {
        let [err, message] = await safeAwait(
            this.service
            .changePassword(req.user._id, req.body))
        if (err) throw err
        res.status(200).json({
            message: 'set new password successfully'
        })
    };
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
    getTotalNumbersOfUsers=async(req,res)=>{
        let [err, documentNumbers] = await safeAwait(
            this.service.getTotalNumbersOfUsers(req.user._id))
        if (err) throw err
        res.status(200).json({
            documentNumbers
        })
    };

    assignMembership=async(req,res)=>{
        let [err, message] = await safeAwait(this.service.assignMembership(req.body.corporateAdmins, req.body.membershipCategory))
        if (err) throw err
        res.status(200).json({
            message: "assign membership  successfully"
        }) 
    }
}

module.exports = ManageCorporateAdminController