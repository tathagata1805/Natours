// GLOBAL EMAIL HANDLER

const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// EMAIL CLASS FOR SENDING EMAILS FOR MULTIPLE PURPOSES
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Tathagata Chakraborty <${process.env.EMAIL_FROM}>`;
  }

  // CREATING TRANSPORTER FOR SENDING MAILS (ENV SPECIFIC)
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // SENDGRID IMPLEMENTATION
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // SENDING THE ACTUAL MAIL
  async send(template, subject) {
    // 1) FIRST RENDER THE PUG TEMPLATE FOR THE EMAIL
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) DEFINE MAIL OPTIONS
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) CREATE A TRANSPORT AND SEND THE MAIL
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to Natours');
  }
};
