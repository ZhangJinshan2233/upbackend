const ManageCorporateAdminController = require('./manageCorporateAdminController');
const ManageUserController = require('./manageUserController');
const {
    manageCorporateAdminService,
    manageUserService
} = require('../../service');
const manageCorporateAdminController = new ManageCorporateAdminController(manageCorporateAdminService);
const manageUserController = new ManageUserController(manageUserService);
module.exports={
    manageCorporateAdminController,
    manageUserController 
}
