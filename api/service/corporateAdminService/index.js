const ManageCorporateAdminService=require('./manageCorporateAdminService')
const ManageUserService=require('./manageUserService')
const {
    GCP
} = require('../../config/index')
const manageCorporateAdminService = new ManageCorporateAdminService("CorporateAdmin", {
    bucketName: GCP.mediaBucket,
    imageDestination: 'profileimages'
});
const manageUserService=new ManageUserService(manageCorporateAdminService);

module.exports={
    manageCorporateAdminService,
    manageUserService
}
