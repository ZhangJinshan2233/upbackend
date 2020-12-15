const deleteFile=require('./deleteGCPFile')
const uploadPhoto=require('./uploadPhoto')
const uploadVideo=require('./uploadVideo')
const getGCPUrl=require('./getGCPUrl');
const getGCPName=require('./getGCPName')
module.exports={
    deleteFile,
    uploadPhoto,
    uploadVideo,
    getGCPUrl,
    getGCPName
}
