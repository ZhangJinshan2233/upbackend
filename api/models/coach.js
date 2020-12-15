'use strict';
const {
    Schema,
    model
} = require('mongoose')
const bcrypt = require('bcrypt')
const baseOptions = {
    discriminatorKey: 'userType', // our discriminator key, could be anything
};
const coachSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    posterUrl: {
        type: String
    },
    posterOriginalname: {
        type: String
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
    gender: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: Number
    },
    status: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, baseOptions)
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

const Coach = model('Coach', coachSchema);

const CommonCoach = Coach.discriminator('CommonCoach', new Schema({
    
    specialities: [{
        _id: false,
       _speciality:{
        type: Schema.Types.ObjectId,
        ref: 'SpecialityCategory',
        default: null,
       }
    }],
    coachees: [{
        _id: false,
        _coachee: {
            type: Schema.Types.ObjectId,
            ref: 'Coachee'
        }
    }]
}))

//for coach who don't work in ProAge
const PartnerCoach = Coach.discriminator('PartnerCoach', new Schema({
    
    specialities: [{
        _id: false,
       _speciality:{
        type: Schema.Types.ObjectId,
        ref: 'SpecialityCategory',
        default: null,
       }
    }]
}))
const AdminCoach = Coach.discriminator('AdminCoach', new Schema({
    coachees: [{
        _id: false,
        _coachee: {
            type: Schema.Types.ObjectId,
            ref: 'Coachee'
        }
    }]
}))

module.exports = {
    Coach,
    CommonCoach,
    AdminCoach,
    PartnerCoach
}