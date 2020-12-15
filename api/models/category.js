'use strict';
const {
    Schema,
    model
} = require('mongoose')
const options = {
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
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, options)

module.exports=model('Category',categorySchema)