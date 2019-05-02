let mailgun = jest.genMockFromModule('mailgun-js');

mailgun = options => ({
  apiKey: options.apiKey,
  domain: options.domain,
  messages: () => ({
    send: mailOptions => new Promise((resolve) => {
      resolve(
        {
          id: `<${mailOptions.from}>`,
          message: 'Queued. Thank you.'
        }
      );
    })
  })
});


module.exports = mailgun;
