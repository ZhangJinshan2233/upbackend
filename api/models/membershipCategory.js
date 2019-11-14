const {Schema,model} =require('mongoose')

membershipCategorySchema=new Schema({
    name:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        required:true,
        default:0
    },
    cost:{
        type:Number,
        required:true,
        default:0
    },
    isObsolete:{
        type:Boolean,
        default:false
    },
    type:{
        type:String,
        required:true,
        default:''
    }
})

module.exports=model('MembershipCategory',membershipCategorySchema)