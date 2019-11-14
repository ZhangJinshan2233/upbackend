const {
    Schema,
    model
} = require('mongoose')
const bcrypt = require('bcrypt')
const coacheeSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    _coach: {
        type: Schema.Types.ObjectId,
        ref: 'Coach',
        default: null,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    userType: {
        type: String,
        default: "freeCoachee"
    },
    gender: {
        type: String,
        required: true
    },
    imgData: {
        type: Buffer,
        default:null
    },
    imgType: {
        type: String,
        default: 'image/jpeg'
    },
    height: {
        type: Number,
        default: 0
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    weight: {
        type: Number,
        default: 0
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    firstTimeLogin: {
        type: Boolean,
        default: true
    },
    lastTimeLogin: {
        type: Date,
        default: Date.now
    },
    membershipEndDate: {
        type: Date
    },
    membershipStartDate: {
        type: Date,
        default:Date.now
    },
    lifeStyleAssessments: [{
        _id: false,
        question: {
            type: String
        },
        result: {
            type: String
        }
    }]
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})
coacheeSchema.pre('save', function (next) {
    var coachee = this;
    if (!coachee.isModified('password')) return next(err);

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(coachee.password, salt, function (err, hash) {
            if (err) return next(err);
            coachee.password = hash;
            next()
        })
    })
})

coacheeSchema.methods.comparePassword = async function (candidatePassword) {

    try {
        const match = await bcrypt.compare(candidatePassword, this.password);
        return match
    } catch (err) {
        throw Error(err)
    }
}


module.exports = model('Coachee', coacheeSchema)