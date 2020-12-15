const {
    Schema,
    model
} = require('mongoose');
const options = {
    discriminatorKey: 'kind'
};
const ScheduledProgrammeSchema = new Schema({
    // _programme: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Programme',
    //     required: true
    // },
    // startTime: {
    //     type: Date,
    //     required: true
    // },
    // duration: {
    //     type: Date,
    //     required: true
    // },
    // trainer: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Coach',
    //     required: true
    // },
    // participantSlots: {
    //     type: Number,
    //     required: true
    // },
    // registeredNum: {
    //     type: Number,
    //     default: 0
    // },
    joinedNum: {
        type: Number,
        default: 0
    },
    isFree: {
        type: Boolean,
        default: true
    },
    isObsolete: {
        type: Boolean,
        default: false
    },
    isOnline: {
        type: Boolean,
        default: true
    },
    // link: {
    //     type: String,
    //     required: true
    // },
    createdDate:{
        type:Date,
        default:Date.now
    },
    status:{
        type:Boolean,
        default:false
    }
}, options)
const ScheduledProgramme=model('ScheduledProgramme',ScheduledProgrammeSchema)
const CorporateScheduledProgramme = ScheduledProgramme.discriminator('goalCategory', new Schema())
module.exports ={
    CorporateScheduledProgramme,
    ScheduledProgramme
}