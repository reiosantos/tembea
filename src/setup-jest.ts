module.exports = () => {
  process.env.NODE_ENV = 'test';
  require('./load-env');
};
