const slackClientAuth = (req, res, next) => {
  const hasSlackHeader = (
    req.headers['x-slack-signature'] || 'null'
  ).startsWith('v0=');
  const isProduction = ['production', 'prod'].includes(process.env.NODE_ENV);
  if (!hasSlackHeader && isProduction) {
    return res.status(200).json({
      success: 'true',
      message: 'Thank you!'
    });
  }
  next();
};

export default slackClientAuth;
