const Router = require('express').Router()

const {
    noteController
} = require('../controllers')

Router
    .route('')
    .post(noteController.create_note)
    .get(noteController.get_notes_pagination)

Router
    .route('/:noteId')
    .get(noteController.get_note_by_id)
    .put(noteController.update_note)



module.exports = Router