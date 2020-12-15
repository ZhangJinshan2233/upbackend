const programmeService = require('../service/programmeService')();
const safeAwait = require('safe-await');
module.exports = () => {
    const programmeController = {};
    programmeController.createNewProgramme = async (req, res) => {
        if (!req.files['video'] || !req.files['poster']) {
            throw new UserFacingError('please add video or photo')
        }
        let [err, programme] = await safeAwait(programmeService.createNewProgramme(req.files['video'][0], req.files['poster'][0], req.body))
        if (err) throw err
        return res.status(200)
            .json(
                programme
            )
    }

    programmeController.updateProgramme = async (req, res) => {
        let videoFile = null;
        let posterFile = null;
        if (req.files['video']) {
            videoFile = req.files['video'][0]
        }
        if (req.files['poster']) {
            posterFile = req.files['poster'][0]
        }
        let updatedProperties = {
            videoFile,
            posterFile,
            ...req.body
        }
        const [err, message] = await safeAwait(programmeService.updateProgramme(req.params.programmeId, updatedProperties))
        if (err) throw err;
        return res.status(201).json({
            message
        })
    }

    programmeController.deleteProgramme = async (req, res) => {
        let [err, message] = await safeAwait(programmeService.deleteProgramme(req.params.programmeId))
        if (err)
            throw new UserFacingError('No such object')
        res.status(200).json({
            message
        })
    }
    return programmeController
}