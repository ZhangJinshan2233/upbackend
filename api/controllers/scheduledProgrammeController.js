const {
  scheduledProgrammeService
} = require('../service')
const safeAwait = require('safe-await');
const Models = require('../models');
const {
  errorHandler
} = require('../middlewares');
const {
  json
} = require('body-parser');
const GetCompanyProcessor = {
  async getCompanyCode(admin) {
    let {
      userType
    } = admin
    if (userType === 'CorporateAdmin') {
      let [errAdmin, corporateAdmin] = await safeAwait(
        getCorporateAdmin(admin._id)
      )
      if (errAdmin) throw errAdmin;
      return corporateAdmin.company._id
    } else {
      let [errcode, companycode] = await safeAwait(
        getCompanyCode()
      )
      if (errcode) throw errAdmin;
      return companycode._id
    }
  }

}

const getCorporateAdmin = async (corporateAdminId) => {
  return Models['CorporateAdmin']
    .findById(corporateAdminId)
    .select('company membershipExpireAt')
    .populate({
      path: 'company',
      select: '_id'
    })
};

const getCompanyCode = async () => {
  return Models['CompanyCode']
    .findOne({
      companyName: "Individual"
    }).select('_id')
}
class ScheduledProgrammeController {
  constructor(service) {
    this.service = service;
  }

  /**
   * create new document
   * @param {*} req 
   * @param {*} res 
   */
  createDocument = async (req, res) => {
    let document = {}
    let [errCompanyCode, companyCode] = await safeAwait(
      GetCompanyProcessor.getCompanyCode(req.user)
    )
    if (errCompanyCode) throw errCompanyCode
    Object.assign(
      document, {
        company: companyCode
      },
      req.body
    )
    const [err, newDocument] = await safeAwait(
      this.service
      .createDocument(document)
    )

    if (err) {
      console.log(err);
      throw new Error('create wrongly')
    }
    res.status(200).json({
      newDocument: JSON.parse(JSON.stringify(newDocument))
    })
  };

  /**
   * get document by id
   * @param {*} req,res
   */
  getDocumentById = async (req, res) => {
    console.log(req.params.id)
    const [err, document] = await safeAwait(
      this.service
      .getDocumentById(req.params.id)
    )
    if (err) throw err
    res.status(200).json({
      document
    })
  };

  /**
   * update document by id
   * @param {*} req 
   * @param {*} res 
   */
  updateDocumentById = async (req, res) => {
    let {
      _id,
      userType
    } = req.user

    if (userType === 'CorporateAdmin') {
      let [errAdmin, corporateAdmin] = await safeAwait(
        getCorporateAdmin(_id)
      )
      if (errAdmin) throw errAdmin;
      if (corporateAdmin.membershipExpireAt < new Date())
        throw new errorHandler
          .UserFacingError('please upgrade membership')
    }
    let [errUpdate, message] = await safeAwait(
      this.service
      .updateDocumentById(req.params.id, req.body)
    )
    if (errUpdate) throw new errorHandler.UserFacingError('update wrongly')
    return res.status(200).json({
      message: "update successfully"
    })
  }

  /**
   * get total number of documents 
   * @param {*} req 
   * @param {*} res 
   */
  getTotalNumbersOfDocuments = async (req, res) => {
    let [errCompanyCode, companyCode] = await safeAwait(
      GetCompanyProcessor.getCompanyCode(req.user)
    )
    if (errCompanyCode) throw errCompanyCode
    const [err, documentNumbers] = await safeAwait(
      this.service
      .getTotalNumbersOfDocuments(companyCode)
    );

    if (err) {
      console.log(err);
      throw err;
    }
    res.status(200).json({
      documentNumbers
    })
  }

  /**admin get documents
   * 
   * @param {*} req 
   * @param {*} res 
   */
  getAllDocuments = async (req, res) => {

    let [errCompanyCode, companyCode] = await safeAwait(
      GetCompanyProcessor.getCompanyCode(req.user)
    )
    if (errCompanyCode) throw errCompanyCode
    const [err, documents] = await safeAwait(
      this.service
      .getAllDocuments(req.query, companyCode)
    )
    if (err) throw err;
    res.status(200).json({
      documents
    })
  }

  /**
   * send reminder emails
   * @param {*} registeredUserIds 
   */
  sendReminderEmails = async (req, res) => {
    try {
      let infos = await this.service.sendMultipleReminderEmails(req.body)
      res.status(200).json({
        infos
      })
    } catch (err) {
      throw err
    }
  }

  /**
   * send recruit emails
   * @param {*} companyCodeId 
   * @param {*} isFree 
   * @param {*} registeredUserIds 
   */
  sendRecruitEmails = async (req, res) => {
    try {
      let infos = await this.service.sendMultipleRecruitEmails(req.body)
      res.status(200).json({
        infos
      })
    } catch (err) {
      throw err
    }

  }

  batchUploadProgrammes = async (req, res) => {
    let [err, message] = await safeAwait(
      this.service.batchUploadProgrammes(req.user._id, req.body)
    )
    if (err) throw err
    res.status(200).json({
      message
    })
  }

  userGetProgrammes = async (req, res) => {
    let [err, documents] = await safeAwait(
      this.service.userGetProgrammes(req.query, req.user._id)
    )
    if (err) throw err;
    let newDocuments = []
    if (documents.length > 0) {
      newDocuments = documents.reduce((acc, current) => {
        let isRegistered = false
        if (current.registeredUsers.includes(req.user._id)) {
          isRegistered = true
        }
        let newDocument = {
          isRegistered,
          ...JSON.parse(JSON.stringify(current))
        }

        return [newDocument, ...acc]
      }, [])
    }
    return res.status(200).json({
      documents: newDocuments
    })
  }

  userGetProgrammeById = async (req, res) => {
    let [err, programme] = await safeAwait(
      this.service
      .userGetProgrammeById(req.params.id, req.user._id)
    )
    if (err) throw err;
    let isRegistered = false
    if (programme.registeredUsers.includes(req.user._id)) {
      isRegistered = true
    }
    let newDocument = {
      isRegistered,
      ...JSON.parse(JSON.stringify(programme))
    }

    res.status(200).json({
      document: newDocument
    })
  }
  /**
   * create new comment
   * @param {*} req 
   * @param {*} res 
   */
  createComment = async (req, res) => {
    let [err, message] = await safeAwait(
      this.service.createComment(req.body, req.params.id, req.user._id)
    )
    if (err) throw err

    return res.status(200).json({
      message: 'add comment successfully'
    })
  }

  /**
   * get comment by user id
   * @param {*} req 
   * @param {*} res 
   */
  getCommentByUserId = async (req, res) => {
    let [err, comment] = await safeAwait(
      this.service
      .getCommentByUserId(req.params.id, req.user._id)
    )
    if (err) throw err
      return res.status(200).json({
        comment: comment
      })
    }
  }


const scheduledProgrammeController = new ScheduledProgrammeController(scheduledProgrammeService)
module.exports = scheduledProgrammeController