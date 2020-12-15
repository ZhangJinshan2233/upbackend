const Models = require('../../models')
const safeAwait = require('safe-await')
const {
    deleteFile,
    uploadPhoto,
    uploadVideo,
    getGCPName,
} = require('../mediaHelper');
module.exports = () => {
    const programmeSrvice = {};
    programmeSrvice.createNewProgramme = async (videoFile, posterFile, otherProperties) => {
        try {
            let {
                video
            } = await uploadVideo(videoFile);
            let {
                poster
            } = await uploadPhoto(posterFile);
            let programme = await Models['Programme'].create({
                ...otherProperties,
                video,
                poster
            })
            return JSON.parse(JSON.stringify(programme))
        } catch (err) {
            return err
        }
    }

    programmeSrvice.updateProgramme = async (programmeId, updatedProperties) => {
        let {
            videoFile,
            posterFile,
            ...otherUpdatedProperties
        } = updatedProperties
        try {
            let newUpdatedProperties = {};
            if (videoFile) {
                let {
                    video
                } = await uploadVideo(videoFile)
                Object.assign(newUpdatedProperties, {
                    video: video
                })
                await deleteFile(videoId);
            }
            if (posterFile) {
                let {
                    poster
                } = await uploadPhoto(posterFile)
                Object.assign(newUpdatedProperties, {
                    poster: poster
                })
                await deleteFile(posterId);
            };

            Object.assign(newUpdatedProperties, otherUpdatedProperties)

            await Models['Programme'].findByIdAndUpdate({
                _id: programmeId
            }, {
                $set: {
                    ...newUpdatedProperties
                }
            })
            return "Updated Successfully"
        } catch (err) {
            throw err
        }
    };

    programmeSrvice.deleteProgramme = async (programmeId) => {

        const [programmeErr, programme] = await safeAwait(Models['Programme']
            .findById(programmeId));

        if (programmeErr) throw new Error('can not find programme');

        let videoId = getGCPName(programe.video);

        let posterId = getGCPName(programme.poster);

        try {
            await Models['Programme']
                .findByIdAndDelete(programmeId);
            await deleteFile(videoId);
            await deleteFile(posterId);

        } catch (err) {
            throw err
        }
        return "Deleted Successfully"
    }
    return programmeSrvice
}