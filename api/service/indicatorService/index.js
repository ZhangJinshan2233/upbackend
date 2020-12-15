const Service = require('../Service');
const Models = require('../../models');
//get different query object of mongoose library base on query conditions
const conditionsProcessor = {
    filter(filter) {
        return {
            name: {
                $regex: filter
            }
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
class IndicatorService extends Service {
    constructor(modelName, uploadOptions) {
        super(modelName, uploadOptions)
        this.modelName = modelName;
    }
    /**
     * get all documents 
     * @param {*} queryParams 
     */
    getAllDocuments = (queryParams) => {
        let {
            sortOrder,
            pageSize,
            pageNumber
        } = queryParams;
        let numSort = sortOrder == 'asc' ? 1 : -1
        pageSize = parseInt(pageSize) || 10
        pageNumber = parseInt(pageNumber) || 0;
        let filter = {};
        filter = queryProcessor(queryParams, 'filter');
        return Models[this.modelName]
            .find(filter)
            .sort({
                createdAt: numSort
            })
            .skip(pageNumber*pageSize)
            .limit(pageSize)
    }
}
const indicatorService = new IndicatorService("Indicator");
module.exports = indicatorService