const 
    proController
= require('../controllers/programmeController')()
const Router = require('express').Router();
const multer = require('multer');

Router
    .route('')
    .post(multer({
        limits: {
            fileSize: 1024 * 1024 * 100
        }
    }).fields([{
        name: 'video',
        maxCount: 1,
    }, {
        name: 'poster',
        maxCount: 1
    }]),proController.createNewProgramme);



module.exports = Router;