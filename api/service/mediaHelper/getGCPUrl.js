const config=require('../../config')
module.exports=(bucketName,fileName)=>{
    return `${config.GCPURLPREFIX}/${bucketName}/${fileName}`
}