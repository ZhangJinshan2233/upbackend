const {
    Schema,
    model
} = require('mongoose');
const ScheduledProgrammeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    company: {
        type: Schema.Types.ObjectId,
        ref: 'CompanyCode',
        default: null,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    personInCharge: {
        type: String,
        default: ''
    },
    trainer: {
        type: String,
        default: ''
    },
    contactNumber: {
        type: String,
        default: null
    },
    capacity: {
        type: Number,
        required: true,
        default: 1
    },
    registeredUsers: [String],
    joinedUsers:  [String],
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
    venueOrLink: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    comments: [{
        user: {
            type: Schema.Types.ObjectId,
            default:null,
            ref: 'Coachee',
        },
        rating: {
            type: Number,
            default: 1
        },
        content: {
            type: String,
            default:''
        },
        createdDate: {
            type: Date,
            default:Date.now
        }
    }]
}, {
    timestamps: {
        createdAt: "createdAt"
    }
})
const ScheduledProgramme = model('ScheduledProgramme', ScheduledProgrammeSchema)
module.exports = ScheduledProgramme