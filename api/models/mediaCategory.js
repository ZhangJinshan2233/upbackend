const {
    Schema
} = require('mongoose')
const Category = require('./category');

const MediaSubcategory = Category.discriminator('MediaSubcategory', new Schema());

const StudioVideoMainCategory = Category.discriminator('StudioVideoMainCategory', new Schema({
    mediaSubcategories: [{
        _id: false,
        _mediaSubcategory: {
            type: Schema.Types.ObjectId,
            ref: 'MediaSubcategory'
        }
    }]
}));

const TipVideoMainCategory = Category.discriminator('TipVideoMainCategory', new Schema({
    mediaSubcategories: [{
        _id: false,
        _mediaSubcategory: {
            type: Schema.Types.ObjectId,
            ref: 'MediaSubcategory'
        }
    }]
}));

const LearnArticleMainCategory = Category.discriminator('LearnArticleMainCategory', new Schema({
    mediaSubcategories: [{
        _id: false,
        _mediaSubcategory: {
            type: Schema.Types.ObjectId,
            ref: 'MediaSubcategory'
        }
    }]
}))
module.exports = {
    MediaSubcategory,
    StudioVideoMainCategory,
    LearnArticleMainCategory,
    TipVideoMainCategory
}