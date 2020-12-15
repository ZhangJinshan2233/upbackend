const {
    articleController
} = require('../controllers')
const Router = require('express').Router();
const passport = require('passport')
const multer = require('multer');

Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }),multer({
        limits: {
            fileSize: 1024 * 1024 * 10
        }
    }).fields([{
        name: 'poster',
        maxCount: 1
    }]), articleController.createDocument)
    .get(passport.authenticate('jwt', {
        session: false
    }),articleController.getAllDocuments)

Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }),articleController.getTotalNumbersOfDocuments)

    Router
    .route('/kind/search')
    .get(passport.authenticate('jwt', {
        session: false
    }),articleController.userGetArticles)

Router
    .route('/kind/:kindName')
    .get(passport.authenticate('jwt', {
        session: false
    }),articleController.getLatestArticlesOfAllCategories)

Router
    .route('/distinctKind')
    .get(passport.authenticate('jwt', {
        session: false
    }),articleController.getKinds)

Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }),articleController.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }),multer({
        limits: {
            fileSize: 1024 * 1024 * 10
        }
    }).fields([{
        name: 'poster',
        maxCount: 1
    }]), articleController.updateDocumentById)

    .delete(passport.authenticate('jwt', {
        session: false
    }),articleController.deleteDocumentById)



module.exports = Router;