import EmailService from '../EmailService';

describe('EmailService Module', () => {
  let mail = new EmailService();

  beforeEach(() => {
    mail = new EmailService();
  });


  it('should initialize mail client', () => {
    mail = new EmailService();
    expect(mail.client).toBeDefined();
    expect(mail.client.apiKey).toBeDefined();
    expect(mail.client.domain).toBeDefined();
  });

  it('should send email', async () => {
    const mailOptions = { from: 'tembea@andela.com', to: 'opsteam@andela.com' };
    const res = await mail.sendMail(mailOptions);
    expect(mail.client).toBeDefined();
    expect(res.message).toEqual('Queued. Thank you.');
  });

  it('should not send email', async () => {
    mail.client = null;
    const mailOptions = { from: '', to: '' };
    const res = await mail.sendMail(mailOptions);
    expect(mail.client).toBeDefined();
    expect(res).toEqual('failed');
  });
});
