const nodemailer = require('nodemailer')
const nodemailerConfig = require('./nodemailerConfig')

const sendEmail = ({to, subject, html}) => {
    let transporter = nodemailer.createTransport(nodemailerConfig);

    return transporter.sendMail({
        from: '"E-commerce API" <process.env.GMAIL_USERNAME>', // sender address
        to,
        subject,
        html
    });

}

module.exports = sendEmail;