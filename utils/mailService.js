const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou ton service SMTP
  auth: {
    user: 'jguiyo@gmail.com',
    pass: 'bshq hqhf wrwn yevr'
  }
});

const sendReminderEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'jguiyo@gmail.com',
    to: to,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email envoyé : ' + info.response);
    }
  });
};

module.exports = sendReminderEmail;
