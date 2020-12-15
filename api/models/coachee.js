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
    group:{
        type: Schema.Types.ObjectId,
        ref: 'CompanyCode',
        default: null,
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
     userType: {
        type: String,
        default: "Coachee"
    },
    isMember:{
        type:Boolean,
        default:false
    },
    gender: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String
    },
    posterOriginalname: {
        type: String
    },
    height: {
        type: Number,
        default: 0,
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    weight: {
        type: Number,
        default: 0,
    },
    phoneNumber: {
        type: Number
    },
    goal:{
        type: Schema.Types.ObjectId,
        ref: 'Category',
        default: null,
    },
    firstTimeLogin: {
        type: Boolean,
        default: true
    },
    lastTimeLogin: {
        type: Date,
        default: Date.now
    },
    addOns:{
        type: Array,
        default:[]
    }
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