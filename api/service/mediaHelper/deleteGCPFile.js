const gcpBucket = require('./gcpBucket');
const safeAwait = require('safe-await');
const gcpMediaService = require('../GcpMediaService')
module.exports = async (bucketName, fileName) => {
  let bucket = gcpBucket(bucketName);
  const [deleteErr, deletedStatus] = await safeAwait(
    bucket.file(fileName).delete()
  )
  if (deleteErr) return deleteErr
  const [err, results] = await safeAwait(gcpMediaService.deleteDocumentByFilepath(fileName))
  if (err) throw err
  return deletedStatus
}