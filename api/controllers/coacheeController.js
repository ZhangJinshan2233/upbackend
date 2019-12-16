const {
    Coachee,
    Coach,
    HabitCategory,
    Habit,
    MembershipCategory,
    Membership,
    MemberRecord,
    CompanyCode,
    IndicatorRecord,
    Indicator
} = require('../models');
const {
    addDays
} = require('date-fns');
const h = require('../helpers');
const _ = require('lodash')
/**
 * @function register
 * @public
 * @param {req.body} :email,password,first_name,last_name.
 * @returns string.
 */

let signup = async (req, res) => {

    let {
        email,
        firstName,
        companyCode: code,
        weight,
        ...otherProperties
    } = req.body

    let coacheePromise = Coachee.findOne({
        email: email
    });
    let coachPromise = Coach.findOne({
        email: email
    });

    let group = ""
    if (code) {
        let companyInfo = await CompanyCode.findOne({
            code
        });
        if (!companyInfo) throw Error('company code does not exist')
        group = companyInfo.companyName;
    } else {
        group = "individual"
    }

    let systyemCoachPromise = Coach
        .findOne({
            email: 'support@uphealth.sg'
        })
        .select('_id');

    let weightIndicatorPromise = Indicator
        .findOne({
            name: 'weight'
        })
        .select('_id');

    let [coachee, coach, systyemCoach, weightIndicator] = await Promise.all([
        coacheePromise,
        coachPromise,
        systyemCoachPromise,
        weightIndicatorPromise
    ])

    if (coach || coachee) throw Error('Email already existed');

    let newUserPromise = Coachee.create({
        _coach: systyemCoach._id,
        group,
        email,
        firstName,
        weight,
        ...otherProperties
    });

    let memberCategoryPromise = MembershipCategory.findOne({
        type: "free"
    })
    let newUserAndMemberCategory = await Promise.all([newUserPromise, memberCategoryPromise])
    let newUser = newUserAndMemberCategory[0];
    let memberCategory = newUserAndMemberCategory[1]
    if (!newUser) throw Error('created unsuccessfully')
    let newMembership = await Membership.create({
        endDate: addDays(Date.now(), memberCategory.duration),
        _coachee: newUser._id,
        _membershipCategory: memberCategory._id
    });

    if (!newMembership) throw Error('failed to register');

    let memberRecord = await MemberRecord.create({
        _coachee: newUser._id,
        _membership: newMembership._id,
        expireAt: addDays(new Date(), memberCategory.duration)
    })

    await IndicatorRecord.create({
        _coachee: newUser._id,
        value: weight,
        _indicator: weightIndicator._id,
        createDate: new Date()
    })
    if (!memberRecord) throw Error('failed to register');

    let emailContent = "Welcome to the UP Health community. " +
        "You'll find no where like this where great place where" +
        " friendships meet professional coaching so that becoming " +
        "healthy becomes more fun and desirable. " +
        "We can't wait for you to join us and work " +
        "toward achieving your health goals together."

    let subjectData = "Registration from UP";
    let htmlData =
        "<html>Hey " + firstName + ",<br/><br/>" + emailContent + "<br/><br/><Table><TR ALIGN='Left'><TD><a href='http://www.uphealth.sg'><img src='http://user-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1440,w_720,f_auto,q_auto/88884/145502_842983.png' height='150' alt='UP logo'></a></TD><TD>Cheering you on,<br>UP Welcome Team <br>T: (+65) 6743 4010<br>W: uphealth.sg <br><br><b><i>UP your health, UP your life!</b></i></TD></TR></Table><br></html>";
    if (newUser)
        h.send_email(email, subjectData, htmlData);
    return res.status(200).json({
        newUser
    })

};

/**
 * @function create new habit of coachee
 * @param {*} req 
 * @param {*} res 
 */
let insert_recommended_habits = async (req, res) => {
    let {
        _id
    } = req.user;
    let randomHabits = []
    //group habit categories by group name
    let groupHabitCategories = await HabitCategory
        .aggregate([{
                $match: {
                    isObsolete: false
                }
            },
            {
                $group: {
                    "_id": "$group",
                    habits: {
                        "$addToSet": {
                            "name": "$name",
                            "description": "$description",
                            "isObsolete": "$isObsolete"
                        }


                    }
                }
            }
        ]).exec();

    //recommend one random habit from each group

    for (let i in groupHabitCategories) {

        randomHabits.push(_.sampleSize(groupHabitCategories[i].habits));

    }
    let recommendHabitlist = _.flatten(randomHabits);

    //insert recommendHabitList into day of the week

    let daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    //habit list of day of week
    let habits = recommendHabitlist.reduce((accmulator, current) => {
        let habit = {
            ...current,
            _coachee: _id,
            daysOfWeek: daysOfWeek
        };
        return [...accmulator, habit]
    }, [])

    let insertedHabitlist = await Habit.insertMany(habits)
    if (!insertedHabitlist.length) throw Error('insert unsuccessfully')

    res.status(200).json({
        message: "insert successfully"

    })
}

get_coachee_by_coacheeId = async (req, res) => {
    let coachee = {}
    let {
        coacheeId: _id
    } = req.params

    coachee = await Coachee.findById(_id)
    if (!coachee) throw Error('can not find')
    res.status(200).json({
        coachee
    })
}
module.exports = {
    signup,
    insert_recommended_habits,
    get_coachee_by_coacheeId
}