import EmailService from '../EmailService';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: () => {}
  }))
}));

describe('EmailService Module', () => {
  it('should create a mailer transport', () => {
    const mail = new EmailService();
    expect(mail).toHaveProperty('transporter');
    expect(mail.transporter).toBeInstanceOf(Object);
    expect(mail.transporter.sendMail).toBeInstanceOf(Function);
  });

  it('should createEmailOptions', () => {
    const mail = new EmailService();
    const options = mail.createEmailOptions('receiver', 'cc', 'subject',
      'message', ['attachments']);

    expect(options).toBeInstanceOf(Object);
    expect(options).toEqual({
      from: mail.hostAddress,
      to: 'receiver',
      cc: 'cc',
      subject: 'subject',
      html: 'message',
      attachments: ['attachments']
    });
    expect(mail.sendMail(options)).toBeUndefined();
  });
});
