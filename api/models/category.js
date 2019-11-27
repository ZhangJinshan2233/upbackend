'use strict';
const {
    Schema,
    model
} = require('mongoose')
var options = {
    discriminatorKey: 'kind'
};
const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default:""
    },
    isObsolete: {
        type: Boolean,
        default: false
    }
}, options, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
})

module.exports=model('Category',categorySchema)