const Models = require('../../models')
const safeAwait = require('safe-await')
module.exports = () => {
    const schProService = {}
    schProService.createScheduledProgramme = async(programmeObject) => {

        const [err, scheduledProgramme] = await safeAwait(
            Models['ScheduledProgramme']
            .create(programmeObject)
        )

        if (err) return err
        return JSON.parse(JSON.stringify(scheduledProgramme))
    }

    return schProService
}