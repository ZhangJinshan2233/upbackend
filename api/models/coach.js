'use strict'
const {
    Schema,
    model
} = require('mongoose')
const bcrypt = require('bcrypt')

const coachSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    imgData: {
        type: Buffer,
        default:null
    },
    imgType: {
        type: String,
        default: 'image/jpeg'
    },
    password: {
        type: String,
        required: true
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
        default: "coach"
    },
    lastTimeLogin: {
        type: Date,
        default: Date.now
    },
    coachees: [{
        _id: false,
        _coachee: {
            type: Schema.Types.ObjectId,
            ref: 'Coachee'
        }
    }],
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

coachSchema.pre('save', function (next) {

    var coach = this;

    if (!coach.isModified('password')) return next(err);

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(coach.password, salt, function (err, hash) {
            if (err) return next(err);
            coach.password = hash;
            next()
        })
    })
})

coachSchema.methods.comparePassword = async function (candidatePassword) {

    try {
        const match = await bcrypt.compare(candidatePassword, this.password);
        return match
    } catch (err) {
        throw Error(err)
    }
}
module.exports = model('Coach', coachSchema)