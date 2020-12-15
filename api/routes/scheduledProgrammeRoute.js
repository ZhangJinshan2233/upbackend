const 
   schProgrammeCtrl
= require('../controllers/scheduledProgrammeController')()
const Router = require('express').Router();
const multer = require('multer');

Router
    .route('')
    .post(schProgrammeCtrl.createScheduledProgramme);



module.exports = Router;