const {
    Schema,
    model
} = require('mongoose');
const bcrypt = require('bcrypt')
const CorporateAdminSchema = new Schema({
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
    company: {
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
        default: "CorporateAdmin"
    },
    posterUrl: {
        type: String
    },
    posterOriginalname: {
        type: String
    },
    phoneNumber: {
        type: Number
    },
    firstTimeLogin: {
        type: Boolean,
        default: true
    },
    isObsolete: {
        type: Boolean,
        default: false
    },
    membersCap: {
        type: Number,
        default: 0
    },
    lastTimeLogin: {
        type: Date,
        default: Date.now
    },
    membershipExpireAt: {
        type: Date,
        default: Date.now
    },
    addOns: {
        type: Array,
        default: []
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

class CorporateAdminClass {
    get fullName() {
        return `${this.firstName} ${this.lastName}`;
    };
    get isMember() {
        return this.membershipExpireAt > new Date();
    };
    async comparePassword(candidatePassword) {
        try {
            const match = await bcrypt.compare(candidatePassword, this.password);
            return match
        } catch (err) {
            throw Error(err)
        }
    }
}
CorporateAdminSchema.loadClass(CorporateAdminClass)

CorporateAdminSchema.pre('save', function (next) {
    let corporateAdmin = this;
    if (!corporateAdmin.isModified('password')) return next(err);

    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(corporateAdmin.password, salt, function (err, hash) {
            if (err) return next(err);
            corporateAdmin.password = hash;
            next()
        })
    })
})

CorporateAdminSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret.id;
        delete password
    }
});
module.exports = model('CorporateAdmin', CorporateAdminSchema)