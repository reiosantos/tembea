const rpn = jest.genMockFromModule('request-promise-native');

const request = opts => new Promise((resolve, reject) => {
  resolve(`{
    ok: true,
  }`);
});

rpn.get.mockImplementation(() => new Promise((resolve, reject) => {
  resolve(
    `{
        error: 'Country does not exist',
        name: 'United States of America'
      }`
  );
}));
rpn.request = request;

module.exports = rpn;
