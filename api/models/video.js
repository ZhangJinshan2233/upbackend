'use strict'
const {
    Schema,
    model
} = require('mongoose');
const autopopulate = require('mongoose-autopopulate')
const options = {
    discriminatorKey: 'kind'
};
const VideoSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    posterUrl: {
        type: String,
        required: true
    },
    viewership: {
        type:Number,
        default: 0
    },
    videoType: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 0
    },
    videoUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    mainCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        autopopulate: {
            select: 'name'
        }
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        autopopulate: {
            select: 'name'
        }
    },
    videoOriginalname: {
        type: String
    },
    posterOriginalname: {
        type: String
    },
    isObsolete: {
        type: Boolean,
        default: false
    },
    isFree: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

}, options)

VideoSchema.plugin(autopopulate)
const Video = model('Video', VideoSchema)
const StudioVideo = Video.discriminator('StudioVideo', new Schema({
    difficulty: {
        type: String,
        required: true,
        default: 'begineer'
    },
    logistics: {
        type: String,
        default: ''
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    trainer: {
        type: Schema.Types.ObjectId,
        ref: 'Coach',
        default: null,
    }
}));
const TipVideo = Video.discriminator('TipVideo', new Schema({
    goal: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}))
module.exports = {
    Video,
    StudioVideo,
    TipVideo
}