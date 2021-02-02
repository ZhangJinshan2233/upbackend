const safeAwait = require('safe-await');
const {
    programmeRecordService
} = require('../service')
class ProgrammeRecordController {
    constructor(service) {
        this.service = service
    }

    /**
     * create new document
     * @param {*} req 
     * @param {*} res 
     */
    createDocument = async (req, res) => {
        let document = {};
        Object.assign(document, {
            _coachee: req.user._id,
            _scheduledProgramme: req.body.scheduledProgrammeId
        });

        let [err, newDocument] = await safeAwait(
            this.service.createDocument(document)
        )

        if (err) throw err;
        res.status(200).json({
            message: 'created successfully'
        })
    }

    /**
     * get document by id 
     * @param {*} _id 
     */
    getDocumentById = async (req, res) => {
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
     * @param {*} _id 
     * @param {*} model 
     */
    updateDocumentById = async (req, res) => {
        let [err, message] = await safeAwait(
            this.service
            .updateDocumentById(req.params.id, req.body)
        )
        if (err) throw err
        return res.status(200).json({
            message: "update successfully"
        })
    }

    getDocuments = async (req, res) => {
        const [err, documents] = await safeAwait(
            this.service
            .getDocuments(req.user._id, req.query)
        )

        if (err) throw err;
        res.status(200).json({
            documents
        })
    }
}

const programmeRecordController = new ProgrammeRecordController(programmeRecordService)
module.exports = programmeRecordController