const Service = require('../Service');
const Models = require('../../models');
//get different query object of mongoose library base on query conditions
const conditionsProcessor = {
    filter(filter) {
        return {
            companyName: {
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
class CompanyCodeService extends Service {
    constructor(modelName, uploadOptions) {
        super(modelName, uploadOptions)
        this.modelName = modelName;
    }

    /**
     * user get articles by conditions
     * @param {*} queryParams 
     */
    getAllDocuments = (queryParams) => {
        let pageNumber = parseInt(queryParams.pageNumber) || 0;
        let numSort = (queryParams.sortOrder == 'asc' ? 1 : -1);
        let pageSize = parseInt(queryParams.pageSize)||10;
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
const companyCodeService = new CompanyCodeService("CompanyCode");
module.exports = companyCodeService