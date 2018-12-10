import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.mailAuth = {
      user: process.env.TEMBEA_MAIL_USER,
      pass: process.env.TEMBEA_MAIL_PASSWORD
    };
    this.mailService = process.env.TEMBEA_MAIL_SERVICE;
    this.hostAddress = process.env.TEMBEA_MAIL_ADDRESS;

    this.transporter = this.createMailTransport();
  }

  createMailTransport() {
    return nodemailer.createTransport({
      service: this.mailService,
      auth: this.mailAuth
    });
  }

  /**
   * ATTACHMENT OPTIONS
   * ------------------
   * filename - filename to be reported as the name of the attached file. Use of unicode is allowed.
   * content - String, Buffer or a Stream contents for the attachment
   * href – an URL to the file (data uris are allowed as well)
   *
   * Example of passing attachments [{first attachment}, {second attachment}]
   *
   * @param receiver
   * @param cc
   * @param subject
   * @param html
   * @param attachments
   * @returns {{from: *, to: *, cc: Array, subject: *, html: *, attachments: Array}}
   */
  createEmailOptions(receiver, cc, subject, html, attachments) {
    return {
      from: this.hostAddress,
      to: receiver,
      cc,
      subject,
      html,
      attachments
    };
  }

  sendMail(mailOptions, callbackFunction) {
    return this.transporter.sendMail(mailOptions, callbackFunction);
  }
}

export default EmailService;
