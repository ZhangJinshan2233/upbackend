const uuid = require('uuid').v4;
const mime = require('mime-types');
const gcpBucket = require('./gcpBucket');
const {
    pipeline
} = require('stream');
const intoStream = require('into-stream');
const getGCPUrl = require('./getGCPUrl');
const gcpMediaService = require('../GcpMediaService');
const safeAwait = require('safe-await')
module.exports = async(uploadOptions, videoFile) => {
    let videoType = mime.lookup(videoFile.originalname);
    let bucket = gcpBucket(uploadOptions.bucketName)
    if (videoFile.fieldname !== 'video')
        throw new Error('please select correct file format');
    const videoBlob = bucket.file(`${uploadOptions.videoDestination}/${uuid()}.${mime.extensions[videoType][0]}`);
    const [err, media] = await safeAwait(gcpMediaService.createDocument({
        originalname: videoFile.originalname,
        filepath: videoBlob.name
    }))
    if (err) throw err;
    return new Promise((resolve, reject) => {
        const videoWriteStream = videoBlob.createWriteStream({
            contentType: videoType,
            predefinedAcl: 'publicRead',
        });
        const videoReadStream = intoStream(videoFile.buffer);
        pipeline(
            videoReadStream,
            videoWriteStream,
            (err) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve({
                    videoUrl: getGCPUrl(uploadOptions.bucketName, videoBlob.name),
                    videoType,
                    videoOriginalname: videoFile.originalname
                })
            }
        )

    })
}