const {
    manageCorporateAdminController: manageCorAdminCtrl,
    manageUserController: manageUserCtrl
} = require('../controllers');
const passport = require('passport');
const Router = require('express').Router()
const multer = require('multer');
Router
    .route('')
    .post(passport.authenticate('jwt', {
        session: false
    }), multer({
        limits: {
            fileSize: 1024 * 1024 * 10
        }
    }).fields([{
        name: 'poster',
        maxCount: 1
    }]), manageCorAdminCtrl.createDocument)
    .get(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.getAllDocuments)

Router
    .route('/count')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.getTotalNumbersOfDocuments)

Router
    .route('/assignCompanyCode')
    .post(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.assignCompanyCode)

Router
    .route('/assignMembership')
    .post(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.assignMembership)

Router
    .route('/signin')
    .post(manageCorAdminCtrl.signin)

Router
    .route('/profile')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.getUserProfile)
    .put(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.updateProfile)

Router
    .route('/users')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.getUsers)
    .post(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.createNewUser)

Router
    .route('/users/count')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.getTotalNumbersOfUsers)

Router
    .route('/users/count/active')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.getNumbersOfActiveUsers)

Router
    .route('/users/move')
    .post(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.moveUserToIndividualGroup)
Router
    .route('/users/batchUpload')
    .post(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.batchUploadCoachees)
Router
    .route('/users/assignMemberships')
    .post(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.assignMemberships)
Router
    .route('/users/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageUserCtrl.getUserById)
    .put(passport.authenticate('jwt', {
        session: false
    }), multer({
        limits: {
            fileSize: 1024 * 1024 * 10
        }
    }).fields([{
        name: 'poster',
        maxCount: 1
    }]), manageUserCtrl.updateUserById)

Router
    .route('/profile/changePassword')
    .put(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.changePassword)

Router
    .route('/:id')
    .get(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.getDocumentById)
    .put(passport.authenticate('jwt', {
        session: false
    }), multer({
        limits: {
            fileSize: 1024 * 1024 * 10
        }
    }).fields([{
        name: 'poster',
        maxCount: 1
    }]), manageCorAdminCtrl.updateDocumentById)

    .delete(passport.authenticate('jwt', {
        session: false
    }), manageCorAdminCtrl.deleteDocumentById)

module.exports = Router