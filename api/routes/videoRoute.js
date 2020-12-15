const {
    videoController
} = require('../controllers')
const Router = require('express').Router();
const multer = require('multer');
const passport = require('passport')
Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }),multer({
        limits: {
            fileSize: 1024 * 1024 * 2000
        }
    }).fields([{
        name: 'video',
        maxCount: 1,
    }, {
        name: 'poster',
        maxCount: 1
    }]), videoController.createDocument)
    .get(videoController.getAllDocuments)
Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }),videoController.getTotalNumbersOfDocuments)

Router
    .route('/kind/search')
    .get(passport.authenticate('jwt', {
        session: false
    }),videoController.userGetVideos)

Router
    .route('/kind/:kindName')
    .get(passport.authenticate('jwt', {
        session: false
    }),videoController.getLatestVideosOfAllCategories)

Router
    .route('/distinctKind')
    .get(passport.authenticate('jwt', {
        session: false
    }),videoController.getKinds)

Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }),videoController.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }),multer({
        limits: {
            fileSize: 1024 * 1024 * 2000
        }
    }).fields([{
        name: 'video',
        maxCount: 1,
    }, {
        name: 'poster',
        maxCount: 1
    }]), videoController.updateDocumentById)

    .delete(videoController.deleteDocumentById)



module.exports = Router;