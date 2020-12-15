const {
    GCP
} = require('../../config');
const {
    Storage
} = require('@google-cloud/storage');

module.exports = (bucketName) => {
    const storage = new Storage({
        projectId: GCP.projectId,
        keyFilename: './gcp_service_credential.json',
    });
    const bucket = storage.bucket(bucketName)
    return bucket
}