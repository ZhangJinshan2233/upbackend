'use strict'
const {
    Schema,
    model
} = require('mongoose');
const options = {
    discriminatorKey: 'kind'
};
const autopopulate = require('mongoose-autopopulate')
const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String
    },
    posterUrl: {
        type: String,
        required: true
    },
    posterOriginalname: {
        type: String
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
    viewership: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        default: ''
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
ArticleSchema.plugin(autopopulate)
const Article = model('Article', ArticleSchema)
const LearnArticle = Article.discriminator('LearnArticle', new Schema({
    urlLink: {
        type: String,
        default: ''
    },
    goal: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
}));
module.exports = {
    Article,
    LearnArticle
}