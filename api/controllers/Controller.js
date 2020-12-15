const safeAwait = require('safe-await')
class Controller {
    constructor(service) {
        this.service = service;
        /**
         * if do not use arrow function, need to deal with like below
         */
        // this.getTotalNumbersOfDocuments=this.getTotalNumbersOfDocuments.bind(this)
    }
    /**
     * create new document
     * @param {*} req 
     * @param {*} res 
     */
    createDocument = async (req, res) => {
        let document = {}
        if (req.hasOwnProperty('files')) {
            if (!req.files['video'] && req.files['poster']) {
                let posterFile = req.files['poster'][0];
                Object.assign(
                    document, {
                        posterFile: posterFile
                    },
                    req.body
                )
            } else {
                let videoFile = req.files['video'][0];
                let posterFile = req.files['poster'][0]
                Object.assign(document, {
                    posterFile: posterFile
                }, {
                    videoFile: videoFile
                }, req.body)
            }
        } else {
            Object.assign(document, req.body)
        }

        const [err, newDocument] = await safeAwait(
            this.service
            .createDocument(document)
        )
        if (err) throw new Error('upload wrongly')
        res.status(200).json({
            newDocument: JSON.parse(JSON.stringify(newDocument))
        })
    };

    /**
     * get document by id
     * @param {*} req,res
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
     * @param {*} req 
     * @param {*} res 
     */
    updateDocumentById = async (req, res) => {
        let changedProperties = {};
        if (Object.keys(req.body).includes('kind')) {
            const {
                kind,
                ...otherProperties
            } = req.body;
            if (req.hasOwnProperty('files')) {
                let videoFile = req.files['video'] ? req.files['video'][0] : null;
                let posterFile = req.files['poster'] ? req.files['poster'][0] : null;
                if (videoFile !== null) {
                    Object.assign(changedProperties, {
                        videoFile: videoFile
                    })
                }
                if (posterFile !== null) {
                    Object.assign(changedProperties, {
                        posterFile: posterFile
                    })
                }
            }
            Object.assign(changedProperties, otherProperties)
            try {
                await this.service
                    .updateDocumentById(req.params.id, kind, changedProperties)
                return res.status(200).json({
                    message: "update successfully"
                })
            } catch (err) {
                throw err
            }
        } else {
            try {
                await this.service
                    .updateDocumentById(req.params.id, req.body)
                return res.status(200).json({
                    message: "update successfully"
                })
            } catch (err) {
                throw err
            }

        }
    }

    /**
     * delete document by id
     * @param {*} req,res
     */
    deleteDocumentById = async (req, res) => {
        const [deleteError, message] = await safeAwait(
            this.service
            .deleteDocumentById(req.params.id)
        )
        if (deleteError) throw deleteError
        res.status(200).json({
            message: 'deleted successfully'
        })
    }

    /**
     * get total number of documents 
     * @param {*} req 
     * @param {*} res 
     */
    getTotalNumbersOfDocuments = async (req, res) => {
        const [err, documentNumbers] = await safeAwait(
            this.service
            .getTotalNumbersOfDocuments()
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
        const [err, documents] = await safeAwait(
            this.service
            .getAllDocuments(req.query)
        )
        if (err) throw err;
        res.status(200).json({
            documents
        })
    }

    /**
     * get total kinds of documents
     */
    getKinds = (req, res) => {
        const kinds = this.service.getKinds()
        res.status(200).json({
            kinds
        })
    }
}
module.exports = Controller