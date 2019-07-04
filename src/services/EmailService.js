import mailgun from 'mailgun-js';
import BugsnagHelper from '../helpers/bugsnagHelper';

class EmailService {
  constructor() {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;

    if (apiKey && domain) {
      const options = {
        apiKey: process.env.MAILGUN_API_KEY,
        domain: process.env.MAILGUN_DOMAIN,
        from: process.env.MAILGUN_SENDER,
      };
      this.client = mailgun(options);
    } else {
      BugsnagHelper.log('Either MAILGUN_API_KEY or '
        + 'MAILGUN_DOMAIN has not been set in the .env ');
    }
  }

  /**
 *
 * @param mailOptions  {sender, receiver, subject, html, attachment }
 * sender and receiver are emails
 * attachment can be an array ['pathToFile1', 'pathToFile2']
 */
  async sendMail(mailOptions) {
    if (this.client) {
      const res = await this.client.messages().send(mailOptions);
      return res;
    }
    return new Promise(resolve => resolve('failed'));
  }
}

export default EmailService;
