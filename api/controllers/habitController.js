'use strict'
const {Habit} = require('../models');
const {
    Types
} = require('mongoose')


let create_habit = async (req, res) => {
    let {
        _id: _coachee
    } = req.user;
    let newHabit = {
        _coachee,
        ...req.body
    }
    let habit = await Habit.create(newHabit)
    res.status(201).json({
        newHabit: habit
    })
}

let get_habits = async (req, res) => {

    let {
        _id
    } = req.user

    let habits = await Habit.find({
        $and: [{
            _coachee: Types.ObjectId(_id)
        }, {
            isObsolete: false
        }]
    })

    res.status(200).json({
        habits: habits
    })
}

let update_habit = async (req, res) => {

    let {
        habitId
    } = req.params
    let changedFields = JSON.parse(JSON.stringify(req.body));
    await Habit.updateOne({
        _id: habitId
    }, {
        $set: changedFields
    }).exec()

    res.status(200).json({
        message: 'update Successfully'
    })
}
module.exports = {
    create_habit,
    get_habits,
    update_habit
}