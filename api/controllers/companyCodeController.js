'use strict'
const randomCode = require('rand-token');
const Controller = require('./Controller');
const {CompanyCode}=require('../models');
const safeAwait = require('safe-await');
const {
    companyCodeService
} = require('../service')
const {
    UserFacingError
} = require('../middlewares').errorHandler
class CompanyCodeController extends Controller {
    constructor(service) {
        super(service);
        this.service = service
    }

    /**
     * create new document
     * @param {*} req 
     * @param {*} res 
     */
    createDocument = async (req, res) => {
        let company = await CompanyCode.findOne({
            companyName: req.body.companyName
        })
        if (company) {
            throw new UserFacingError('company name or code existed')
        }
        let document = {}
        let code = randomCode.generate(6).toLowerCase()
        Object.assign(document, req.body, {
            code: code
        })
        const [err, newDocument] = await safeAwait(
            this.service
            .createDocument(document)
        )
        if (err) throw new Error('upload wrongly')
        res.status(200).json({
            newDocument: JSON.parse(JSON.stringify(newDocument))
        })
    };
}

const companyCodeController = new CompanyCodeController(companyCodeService)
module.exports = companyCodeController