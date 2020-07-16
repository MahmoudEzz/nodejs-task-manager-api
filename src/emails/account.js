const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name)=>{
    sgMail.send({
        from: 'mahmoud.ezz49@gmail.com',
        to: email,
        subject: 'Welcome to the club',
        text: `welcome to our node project, ${name}. Let me know how you get along with the App.`
    })
}

const sendCancelationEmail = (email, name)=>{
    sgMail.send({
        from: 'mahmoud.ezz49@gmail.com',
        to: email,
        subject: 'Gonna be missed',
        text: `Thanks for your adventure with us but can we know why you canceled your account, ${name}?`
    })
}
module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
};