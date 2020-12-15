const uuid = require('uuid').v4;
const mime = require('mime-types');
const gcpBucket = require('./gcpBucket');
const intoStream = require('into-stream')
const getFileType = require('./getFileType');
const getGCPUrl = require('./getGCPUrl');
const gcpMediaService = require('../GcpMediaService');
const safeAwait = require('safe-await');
const {
    pipeline
} = require('stream')
module.exports = async (uploadOptions, posterFile) => {
    let posterType = mime.lookup(posterFile.originalname);
    let bucket = gcpBucket(uploadOptions.bucketName)
    if (getFileType(posterType) !== 'image')
        throw new Error('please select correct file format');
    const posterBlob = bucket.file(`${uploadOptions.imageDestination}/${uuid()}.${mime.extensions[posterType][0]}`);
    const [err, media] = await safeAwait(gcpMediaService.createDocument({
        originalname: posterFile.originalname,
        filepath: posterBlob.name
    }))
    if (err) throw err;
    return new Promise((resolve, reject) => {
        let posterReadStream = intoStream(posterFile.buffer)
        const posterWriteStream = posterBlob.createWriteStream({
            contentType: posterType,
            predefinedAcl: 'publicRead'
        });
        pipeline(
            posterReadStream,
            posterWriteStream,
            (err) => {
                if (err) {
                    console.log(err)
                    reject(err)
                }
                resolve({
                    posterUrl: getGCPUrl(uploadOptions.bucketName, posterBlob.name),
                    posterOriginalname: posterFile.originalname
                })
            }
        )
    })
}