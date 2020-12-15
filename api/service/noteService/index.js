const Service = require('../Service');
const Models = require('../../models');
const {Types}=require('mongoose')
//get different query object of mongoose library base on query conditions
const conditionsProcessor = {
    filter(filter) {
        return {
            _coachee:Types.ObjectId(filter)
        }
    }
}

const queryProcessor = (queryParams, param) => {
    if (queryParams.hasOwnProperty(param)) {
        return conditionsProcessor[param](queryParams[param]);
    } else {
        return {}
    }
}
class NoteService extends Service {
    constructor(modelName, uploadOptions) {
        super(modelName, uploadOptions)
        this.modelName = modelName;
    }
    /**
     * get all documents 
     * @param {*} queryParams 
     */
    getAllDocuments = (queryParams) => {
        let skipNum = parseInt(queryParams.skipNum) || 0;
        let numSort = -1;
        let pageSize =10;
        let filter = {};
        filter = queryProcessor(queryParams, 'filter');
        return Models[this.modelName]
            .find(filter)
            .sort({
                createdAt: numSort
            })
            .skip(skipNum)
            .limit(pageSize)
    }
}
const noteService = new NoteService("Note");
module.exports = noteService