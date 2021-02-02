'use strict'
const config = require('../../config');
const nodemailer = require('nodemailer');
const {
    format,
    parseISO
} = require('date-fns')
class EmailService {
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }
    resetPasswordEmailConfig = {
        subjectData: "Reset password"
    };
    welcomeEmailConfig = {
        emailContent: "Welcome to FLOURISH. This is your one-stop go to service integrating your unique lifestyle <br/>" +
            "to meet your personal wellbeing goals. Now becoming healthy can be fun and desirable.<br/>" +
            "We can't wait for you to join us and work toward achieving your health goals together. ",
        subjectData: "Welcome to FLOURISH!"
    };
    senderEmailAuthConfig = {
        user: config.senderEmailAuth.user,
        pass: config.senderEmailAuth.pass,
        email: config.senderEmail
    }

    recruitEmailConfig = {
        emailContent: "*FLOURISH is your one-stop, personalised wellbeing app connecting you to a network of<br/> " +
            "  multi-disciplinary health experts brought to you by your company’s wellness/HR team.  ",
        subjectData: "Join our Flourish exclusive experiential workshops (limited slots)!"
    }

    reminderEmailConfig = {
        emailContent: "We look forward to seeing you there so remember to " +
            " block it in your calendars!",

        subjectData: "It’s happening soon – the Flourish workshop you’ve signed up for!",
    }
    createTransporter = (user, pass) => {
        let transporter = nodemailer.createTransport({
            host: this.host,
            port: this.port,
            secure: false,
            auth: {
                user: process.env.MAILJET_API_KEY || user,
                pass: process.env.MAILJET_API_SECRET || pass
            }
        });
        return transporter
    }
    organizeEmail = async (transporter, fromEmail, toEmail, subjectData, htmlData) => {
        return transporter.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: subjectData,
            html: htmlData,
        })
    }

    sendResetPasswordEmail=async(coachee,randPassword)=>{
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let htmlData =
            "<html>Hey " + coachee.firstName + ",<br/><br/>" +
            "We've glad to have changed your password to " + "<p style='color:red'>" + randPassword + "</p>" +
            " so that you're able to login and connect with your FLOURISH Community soon!<br/><br/>"+
            "You may change the password again if you like in your Settings page in our app.<br/><br/>"+
            "<TD>Cheering you on,<br/>The FLOURISH Team</TD>" +
            "<br/><br/><TD><p><img src='https://storage.googleapis.com/flourish/uploadfiles/Flourish_Logo_Primary.png' height='40px' width='120px' alt='flourish logo'></p></TD><br/>" +
            "</TR></Table></html>"
        return this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.resetPasswordEmailConfig.subjectData, htmlData)
    }

    sendWelcomeEmail = async (coachee) => {
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let htmlData =
            "<html>Hey " + coachee.firstName + ",<br/><br/>" +
            this.welcomeEmailConfig.emailContent +
            "<TD>Cheering you on,<br/>The FLOURISH Team</TD>" +
            "<br/><br/><TD><p><img src='https://storage.googleapis.com/flourish/uploadfiles/Flourish_Logo_Primary.png' height='40px' width='120px' alt='flourish logo'></p></TD><br/>" +
            "</TR></Table></html>"
        return this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.welcomeEmailConfig.subjectData, htmlData)
    }

    sendMultipleRecuritEmails = async (coachees, programme) => {
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let sendPromises = []
        let date = format(new Date(parseISO(programme.startDate)), 'dd/MM/yyyy hh:mm a');
        coachees.forEach(coachee => {
            let htmlData =
                "<html>Hey " + coachee.firstName + ",<br/><br/>" +
                "Did you know that the workshop, <b>" + programme.name + "</b> is coming up<br/>" +
                " on <b>" + date + "</b>? We think you’ll like it and it’ll help you improve your <br/>" +
                "personal goal.<br/><br/>" +
                "Find out more information about this workshop and sign up via the Flourish app before slots <br/>" +
                "fill up to learn how to improve your personal goal.  " +
                "<br/><br/><Table><TR ALIGN='Left'>" +
                "<TD>Cheering you on,<br/>The FLOURISH Team</TD>" +
                "<br/><br/><TD><p><img src='https://storage.googleapis.com/flourish/uploadfiles/Flourish_Logo_Primary.png' height='40px' width='120px' alt='flourish logo'></p></TD><br/>" +
                "</TR></Table><br/>" +
                this.recruitEmailConfig.emailContent + "<br/></html>"
            let sendPromise = this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.recruitEmailConfig.subjectData, htmlData)
            sendPromises.push(sendPromise)
        })
        return Promise.all(sendPromises)
    }

    sendMultipleRemindersEmails = async (coachees, programme) => {
        console.log(coachees)
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let sendPromises = [];
        let date = format(new Date(parseISO(programme.startDate)), 'dd/MM/yyyy hh:mm a');
        let venueOrLinkString = ''
        if (programme.isOnline) {
            let password = 'No'
            if (programme.password) {
                password = programme.password
            }
            venueOrLinkString =
                "Online Link: <b>" + programme.venueOrLink + "</b><br/>" +
                "Password: " + password
        } else {
            venueOrLinkString =
                "Online Link: <b>" + programme.venueOrLink + "</b>"
        }
        coachees.forEach(coachee => {
            let htmlData =
                "<html>Hey " + coachee.firstName + ",<br/><br/>" +
                "We’re just a few days away from the <b>" + programme.name + "</b><br/>" +
                " workshop coming up on <b>" + date + "</b>. We look forward to seeing you there so remember <br/>" +
                "to block it in your calendars! <br/><br/>" +
                venueOrLinkString +
                "<br/><br/><Table><TR ALIGN='Left'>" +
                "<TD>Cheering you on,<br/>The FLOURISH Team</TD>" +
                "<br/><br/><TD><p><img src='https://storage.googleapis.com/flourish/uploadfiles/Flourish_Logo_Primary.png' height='40px' width='120px' alt='flourish logo'></p></TD><br/>" +
                "</TR></Table><br/>" +
                this.recruitEmailConfig.emailContent + "<br/></html>"
            let sendPromise = this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.reminderEmailConfig.subjectData, htmlData)
            sendPromises.push(sendPromise)
        })
        return Promise.all(sendPromises)
    }
}

const emailService = new EmailService(config.emailHost, config.emailPort);

module.exports = emailService