const Models = require('../../models');
const safeAwait = require('safe-await');
const {
    Types
} = require('mongoose')
const {
    errorHandler
} = require('../../middlewares')
class ProgrammeRecordService {
    constructor(modelName) {
        this.model = Models[modelName];
    }
    addUserToProgramme = async (scheduledProgrammeId, userId) => {
        return Models['ScheduledProgramme']
            .findByIdAndUpdate(scheduledProgrammeId, {
                $push: {
                    registeredUsers: userId
                }
            })
    }

    removeUserFromProgram = async (scheduledProgrammeId, userId) => {
        return Models['ScheduledProgramme']
            .findByIdAndUpdate(scheduledProgrammeId, {
                $pull: {
                    registeredUsers: userId
                }
            })
    }

    updateProgrammeRecordById = async (_id, changedProperties) => {
        return this.model
            .findByIdAndUpdate(_id, {
                $set: changedProperties
            })
    }
    /**
     * create new document
     * @param {*} properties 
     */
    createDocument = async (document) => {
        let {
            _coachee,
            _scheduledProgramme
        } = document;

        let scheduledProgramme = await Models['ScheduledProgramme']
            .findById(_scheduledProgramme)
            .select('capacity registeredUsers')
        let registeredUsersNums = scheduledProgramme.registeredUsers.length ? scheduledProgramme.registeredUsers.length : 0;
        if (scheduledProgramme.capacity <= registeredUsersNums) {
            return Promise.resolve('No slot')
        }
        let programmeRecord = await this.model.findOne({
            $and: [{
                    _coachee: _coachee
                },
                {
                    _scheduledProgramme: _scheduledProgramme
                }
            ]
        })
        if (programmeRecord) { //judge user has registered or not
            if (programmeRecord.isObsolete) {
                let updateRecordAndProgrammePromises = []
                let updateRecordPromise = programmeRecord.updateOne({
                    $set: {
                        isObsolete: false //user deleted registered record
                    }
                }).exec()
                let updateScheduledProgrammePromise = this.addUserToProgramme(_scheduledProgramme, _coachee)
                updateRecordAndProgrammePromises.push(updateRecordPromise);
                updateRecordAndProgrammePromises.push(updateScheduledProgrammePromise);
                return Promise.all(updateRecordAndProgrammePromises)
            } else {
                return Promise.resolve('add already')
            }
        } else {
            let createAndUpdatePromises = []
            let createNewdocumentPromise = this.model.create(document)
            createAndUpdatePromises.push(createNewdocumentPromise)
            let updateScheduledProgrammePromise = this.addUserToProgramme(_scheduledProgramme, _coachee)
            createAndUpdatePromises.push(updateScheduledProgrammePromise)
            return Promise.all(createAndUpdatePromises)
        }

    }

    /**
     * get document by id 
     * @param {*} _id 
     */
    getDocumentById = async (_id) => {
        return this.model
            .findById(_id)
            .populate({
                path: "_scheduledProgramme",
                select: 'name registeredUsers isOnline password joinedUsers endDate capacity startDate description trainer  venueOrLink'
            })
    };

    /**
     * update document by id 
     * @param {*} _id 
     * @param {*} model 
     */
    updateDocumentById = async (_id, changedProperties) => {
        let [err, programmeRecord] = await safeAwait(
            this.getDocumentById(_id)
        )
        if (err) throw err
        let updatePromises = [];
        if (Object.keys(changedProperties).includes('isObsolete') && changedProperties['isObsolete']) {
            let updateProgrammeRecordPromise = this.updateProgrammeRecordById(_id, changedProperties)
            let updateScheduledProgrammePromise = this.removeUserFromProgram(programmeRecord._scheduledProgramme, programmeRecord._coachee)
            updatePromises.push(updateScheduledProgrammePromise);
            updatePromises.push(updateProgrammeRecordPromise);
            return Promise.all(updatePromises)
        } else if (Object.keys(changedProperties).includes('isObsolete') && !changedProperties['isObsolete']) {
            let updateProgrammeRecordPromise = this.updateProgrammeRecordById(_id, changedProperties)
            let updateScheduledProgrammePromise = this.addUserToProgramme(programmeRecord._scheduledProgramme, programmeRecord._coachee)
            updatePromises.push(updateScheduledProgrammePromise);
            updatePromises.push(updateProgrammeRecordPromise);
            return Promise.all(updatePromises)
        } else {
            return this.updateProgrammeRecordById(_id, changedProperties)
        }
    }

    getDocuments = async (_coahcee, queryParams) => {
        let skipNum = parseInt(queryParams.skipNum) || 0;
        let numSort = -1;
        let pageSize = 10;
        return this.model
            .find({
                $and: [{
                        _coachee: _coahcee
                    },
                    {
                        isObsolete: false
                    }
                ]
            })
            .sort({
                createdAt: numSort
            })
            .skip(skipNum)
            .limit(pageSize)
            .populate({
                path: "_scheduledProgramme",
                select: 'name endDate  startDate'
            })
    }
}

const programmeRecordService = new ProgrammeRecordService("ProgrammeRecord");
module.exports = programmeRecordService