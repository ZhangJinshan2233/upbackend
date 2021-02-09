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

    publicEmailContent =
        "<Table><TR>Cheering you on,</TR>" +
        "<TR><br/>The Flourish team</TR>" +
        "<TR><br/><hr></TR>" +
        "<TR><br/>  Flourish is your personal wellbeing app brought to you by your company’s wellness / HR team.</TR>" +
        "<TR align='center'><br/><img src='https://storage.googleapis.com/flourish/uploadfiles/Flourish_Logo_Primary.png' margin-left='100px' height='40px' width='120px' alt='flourish logo'></TR>" +
        "</Table>"
    resetPasswordEmailConfig = {
        subjectData: "Here’s your new Flourish password "
    };
    welcomeEmailConfig = {
        emailContent: "<p>Welcome to Flourish. This is your one-stop wellbeing app to achieve all your health" +
            "goals with the help of " + "<b>real health professionals and accessible as and when your lifestyle allows for it.</b> " +
            "Now becoming healthy can be fun and desirable. We can't wait for you to join our community" +
            "and work toward achieving your health goals together.</p>",
        subjectData: " Welcome to Flourish!"
    };
    senderEmailAuthConfig = {
        user: config.senderEmailAuth.user,
        pass: config.senderEmailAuth.pass,
        email: config.senderEmail
    }

    recruitEmailConfig = {
        subjectData: "Join our Flourish exclusive experiential workshops (limited slots)! "
    }

    reminderEmailConfig = {
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

    sendResetPasswordEmail = async (coachee, randPassword) => {
        let firstName = coachee['firstName'].toUpperCase();
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let htmlData =
            "<html> <p>Hey " + firstName + ", it happens, we all forget our passwords sometimes." +
            " No worries, here’s your new password to login with:</p>" +
            "<p style='color:red'>" + randPassword + "</p>" +
            "<p>We look forward to seeing you back on Flourish and sharing the best in health and wellness with you! </p>" +
            "<p>P.S. You may change the password again if you like in your Menu tab in our app. </p>" +
            this.publicEmailContent + "</html>"
        return this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.resetPasswordEmailConfig.subjectData, htmlData)
    }

    sendWelcomeEmail = async (coachee) => {
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let firstName = coachee['firstName'].toUpperCase()
        let htmlData =
            "<html> <p>Hey " + firstName + ",</p>" +
            this.welcomeEmailConfig.emailContent +
            this.publicEmailContent + "</html>"
        return this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.welcomeEmailConfig.subjectData, htmlData)
    }

    sendMultipleRecuritEmails = async (coachees, programme) => {
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let sendPromises = []
        let programmeName = programme['name'][0].toUpperCase() + programme['name'].slice(1);
        let date = format(new Date(parseISO(programme.startDate)), 'dd/MM/yyyy hh:mm a');
        coachees.forEach(coachee => {
            let firstName = coachee['firstName'].toUpperCase()
            let htmlData =
                "<html> <p>Hey " + firstName + ",</p>" +
                "<p>Here’s a workshop that we think you’ll like that might improve your personal wellbeing: </p>" +
                "<p><b>" + programmeName + "</b></p>" +
                "<p><b>" + date + "</b></p>" +
                "<p>Find out more information about this workshop and sign up via the Flourish app before slots fill up.</p>" +
                this.publicEmailContent + "</html>"
            let sendPromise = this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.recruitEmailConfig.subjectData, htmlData)
            sendPromises.push(sendPromise)
        })
        return Promise.all(sendPromises)
    }

    sendMultipleRemindersEmails = async (coachees, programme) => {
        let transporter = this.createTransporter(this.senderEmailAuthConfig.user, this.senderEmailAuthConfig.pass)
        let sendPromises = [];
        let programmeName = programme['name'][0].toUpperCase() + programme['name'].slice(1);
        let date = format(new Date(parseISO(programme.startDate)), 'dd/MM/yyyy hh:mm a');
        let venueOrLinkString = ''
        if (programme.isOnline) {
            let password = 'No'
            if (programme.password) {
                password = programme.password
            }
            venueOrLinkString =
                "<p>Online Link: <b>" + programme.venueOrLink + "</b></p>" +
                "<p>Password:  <b>" + password + "</b></p>"
        } else {
            venueOrLinkString =
                "<p>Venue:<b>" + programme.venueOrLink + "</b></p>"
        }
        coachees.forEach(coachee => {
            let firstName = coachee['firstName'].toUpperCase()
            let htmlData =
                "<html> <p>Hey " + firstName + ",</p>" +
                "<p>We’re just a few days away from your upcoming workshop: </p>" +
                "<p><b>" + programmeName + "</b></p>" +
                "<p><b>" + date + "</b></p>" +
                "<p>We look forward to seeing you there so remember to block it in your calendars!</p>" +
                venueOrLinkString +
                this.publicEmailContent + "</html>"
            let sendPromise = this.organizeEmail(transporter, this.senderEmailAuthConfig.email, coachee.email, this.reminderEmailConfig.subjectData, htmlData)
            sendPromises.push(sendPromise)
        })
        return Promise.all(sendPromises)
    }
}

const emailService = new EmailService(config.emailHost, config.emailPort);

module.exports = emailService