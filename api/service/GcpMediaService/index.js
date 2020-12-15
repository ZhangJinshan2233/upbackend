const Models = require('../../models')
class GcpMediaService {
    constructor(modelName) {
        this.modelName = modelName;
    }

    createDocument = (document) => {
        return Models[this.modelName].create({
            ...document
        })
    }
    /**
     * delte document by id 
     * @param {*} _id 
     */
    deleteDocumentByFilepath = async (filepath) => {
        return Models[this.modelName].findOneAndDelete(filepath)
    };
}
const gcpMediaService = new GcpMediaService("GcpMedia");
module.exports = gcpMediaService