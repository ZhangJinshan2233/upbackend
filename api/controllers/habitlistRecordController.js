'use strict'
const {
    HabitlistRecord,
    Habit
} = require('../models');
const {
    getDay,
    subDays,
    format,
    lastDayOfWeek
} = require('date-fns');
const h = require('../helpers')
const {
    Types
} = require('mongoose');

let update_current_habit_record = async (req, res) => {

}
/**
 * @function create new habit record;
 * @param{name, groupName,description};
 */

let create_habit_record = async (req, res) => {
    let {
        _id
    } = req.user

    let {
        startOfDay,
        endOfDay
    } = h.convert_time_to_localtime(req.body.createDate)
    let habitlistRecordOfDay = await HabitlistRecord.findOne({
        $and: [{
                _coachee: Types.ObjectId(_id)
            },
            {
                createDate: {
                    $gte: startOfDay
                }
            }, {
                createDate: {
                    $lte: endOfDay
                }
            }
        ]
    })
    if (habitlistRecordOfDay) {
        res.status(201).json({
            habitsOfScheduleDay: habitlistRecordOfDay
        })
    } else {
        let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        let habits = []
        let currentDay = daysOfWeek[getDay(startOfDay)];
        let habitsOfCurrentDay = await Habit
            .find({
                $and: [{
                        _coachee: Types.ObjectId(_id)
                    }, {
                        isObsolete: false
                    },
                    {
                        daysOfWeek: currentDay
                    }
                ]
            })
            .select('_id')

        if (habitsOfCurrentDay.length > 0) {
            habits = habitsOfCurrentDay.reduce((acc, current) => {
                let {
                    _id
                } = current
                return [...acc, {
                    _habit: _id,
                    status: false
                }]
            }, [])
        }
        let newhabits = await HabitlistRecord
            .create({
                _coachee: Types.ObjectId(_id),
                createDate: startOfDay,
                habits
            })
        let habitsOfScheduleDay = await HabitlistRecord
            .findById(newhabits._id)
            .populate({
                path: 'habits._habit',
                select: 'name'
            })
        res.status(201).json({
            habitsOfScheduleDay
        })
    }
};

/**
 * 
 * @param {start of day, end of day} req 
 * @param {*} res 
 */
let get_habitlist_record_of_day = async (req, res) => {
    let _coachee
    let {
        _id
    } = req.user;
    let {
        coachee
    } = req.query
    coachee == undefined || null ? _coachee = _id : _coachee = coachee
    let {
        startOfDay,
        endOfDay
    } = h.convert_time_to_localtime(req.query.scheduleDay)
    let habitsOfScheduleDay = await HabitlistRecord
        .findOne({
            $and: [{
                    _coachee
                },
                {
                    createDate: {
                        "$gte": startOfDay
                    }
                }, {
                    createDate: {
                        "$lte": endOfDay
                    }
                }
            ]
        })
        .populate({
            path: 'habits._habit',
            select: 'name'
        })

    res.status(200).json({
        habitsOfScheduleDay
    })
};

let get_habitlist_record_of_current_week = async (req, res) => {
    let {
        coacheeId: _coachee
    } = req.params;

    let weekHabitlist = [{
            day: 'Sunday',
            habits: []
        },
        {
            day: 'Monday',
            habits: []
        },
        {
            day: 'Tuesday',
            habits: []
        },
        {
            day: 'Wednesday',
            habits: []
        },
        {
            day: 'Thursday',
            habits: []
        }, {
            day: 'Friday',
            habits: []
        }, {
            day: 'Saturday',
            habits: []
        }
    ];
    let lastDayWeek = format(lastDayOfWeek(new Date()), 'MM/dd/yyyy');
    let firstDayWeek = format(subDays(new Date(lastDayWeek), 6), 'MM/dd/yyyy');
    let habitlistRecordOfWeek = await HabitlistRecord.find({
            $and: [{
                    _coachee
                },
                {
                    createDate: {
                        $gte: new Date(firstDayWeek).setHours(0, 0, 0, 0)
                    }
                }, {
                    createDate: {
                        $lte: new Date(lastDayWeek).setHours(23, 59, 59, 999)
                    }
                }
            ]
        })
        .populate({
            path: 'habits._habit',
            select: 'name'
        })

    if (habitlistRecordOfWeek.length > 0) {
        for (let j = 0; j < habitlistRecordOfWeek.length; j++) {
            let daynumber = getDay(habitlistRecordOfWeek[j].createDate);
            let day = ''
            switch (daynumber) {
                case 0:
                    day = 'Sunday'
                    break;
                case 1:
                    day = 'Monday'
                    break;
                case 2:
                    day = 'Tuesday'
                    break;
                case 3:
                    day = 'Wednesday'
                    break;
                case 4:
                    day = 'Thursday'
                    break;
                case 5:
                    day = 'Friday'
                    break;
                case 6:
                    day = 'Saturday'
                    break;
                default:
                    break

            }
            for (let i = 0; i < weekHabitlist.length; i++) {
                if (weekHabitlist[i].day === day) {
                    weekHabitlist[i].habits = habitlistRecordOfWeek[j].habits
                }
            }
        }
    }
    res.status(200).json({
        weekHabitlist
    })
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
let update_habit_status = async (req, res) => {
    let {
        name,
        status
    } = req.body
    let {
        habitlistId
    } = req.params;
    await HabitlistRecord.updateOne({
        _id: habitlistId,
        habits: {
            "$elemMatch": {
                name: name
            }
        }
    }, {
        $set: {
            'habits.$.status': status
        }
    }).exec()
    res.status(200).json({
        message: 'update successfully'
    })
}
module.exports = {
    create_habit_record,
    get_habitlist_record_of_day,
    update_habit_status,
    get_habitlist_record_of_current_week
}