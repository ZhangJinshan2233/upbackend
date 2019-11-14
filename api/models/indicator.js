'use strict'
const {Schema,model}=require('mongoose');

const indicatorSchema=new Schema({
    name: {
        type: String,
        required: true
    },
    group: {
        type: String,
        required: true
    },
    unit:{
        type:String,
        required:true
    },
    isObsolete: {
        type: Boolean,
        default: false
    }
})

module.exports=model('Indicator',indicatorSchema)