import EmailService from '../EmailService';

describe('EmailService Module', () => {
  let mail;

  beforeEach(() => {
    mail = new EmailService();
    mail.client.messages = () => ({
      send: async (options) => new Promise(
        (resolve, reject) => {
          if (options.to === '') reject(new Error('failed'));
          resolve({ message: 'Queued. Thank you.' });
        }
      )
    });
  });


  it('should initialize mail client', () => {
    expect(mail.client).toBeDefined();
    expect(mail.client.apiKey).toBeDefined();
    expect(mail.client.domain).toBeDefined();
  });

  it('should send email', async () => {
    const mailOptions = { from: 'tembea@andela.com', to: 'opsteam@andela.com', text: 'hello' };
    const res = await mail.sendMail(mailOptions);
    expect(mail.client).toBeDefined();
    expect(res.message).toEqual('Queued. Thank you.');
  });

  it('should not send email', async () => {
    const [apiKey, domain] = [
      process.env.MAILGUN_API_KEY,
      process.env.MAILGUN_DOMAIN
    ];
    process.env.MAILGUN_API_KEY = '';
    process.env.MAILGUN_DOMAIN = '';

    const mailOptions = { from: '', to: '' };
    const nmail = new EmailService();
    const res = await nmail.sendMail(mailOptions);
    expect(res).toEqual('failed');

    process.env.MAILGUN_API_KEY = apiKey;
    process.env.MAILGUN_DOMAIN = domain;
  });
});
