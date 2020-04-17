const {
    Note
} = require('../models')
const {
    Types
} = require('mongoose')
/**
 * @function create new note;
 * @param{};
 */
let create_note = async (req, res) => {

    let newNote = await Note.create(req.body)

    if (!newNote) throw new Error('unsuccessfully');
    res.status(200).json({
        newNote
    })
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_notes_pagination = async (req, res) => {
    let {
        coacheeId: _coachee
    } = req.query;
    let notes = []
    let skipNum = parseInt(req.query.skipNum) || 0;
    let recordSize = 10;
    notes = await Note.find({
            $and: [{
                _coachee
            }, {
                isObsolete: false
            }]
        })
        .sort({
            createdDate: -1
        })
        .skip(skipNum)
        .limit(recordSize)
        .exec()

    res.status(200).json({
        notes
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let get_note_by_id = async (req, res) => {
    let {
        noteId: _id
    } = req.params;
    let note = await Note.findById(_id)

    res.status(200).json({
        note
    })
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let update_note = async (req, res) => {
    let {
        noteId: _id
    } = req.params
    console.log(_id)
    let changedProperties = req.body

    await Note.findByIdAndUpdate(
        _id, {
            $set: changedProperties
        }).exec();

    res.status(200).json({
        message: "updated successfully"
    })

}
module.exports = {
    create_note,
    get_notes_pagination,
    get_note_by_id,
    update_note
}