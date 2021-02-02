const {
    indicatorService
} = require('../service')
const Controller = require('./Controller')
class IndicatorController extends Controller {
    constructor(service) {
        super(service)
        this.service = service
    }
}

const indicatorController = new IndicatorController(indicatorService)
module.exports = indicatorController