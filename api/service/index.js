
const companyCodeService= require('./companyCodeService')
const {videoService,articleService}=require('./mediaService')
const challengeService=require('./challengeService')
const noteService=require('./noteService')
const indicatorService=require('./indicatorService')
const memberService=require('./memberService')();
const gcpMediaService=require('./GcpMediaService')
const {
    manageCorporateAdminService,
    manageUserService
}=require('./corporateAdminService');

const scheduledProgrammeService=require('./scheduledProgrammeService');
const programmeRecordService=require('./programmeRecordService')
module.exports = {
    indicatorService,
    challengeService,
    companyCodeService,
    videoService,
    articleService,
    noteService,
    memberService,
    gcpMediaService,
    manageCorporateAdminService,
    manageUserService,
    scheduledProgrammeService,
    programmeRecordService
}