export const noUserPayload = {
  email: 'unKnownEmail@test.com',
  name: 'test',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const noEmailPayload = {
  name: 'test',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const invalidEmailPayload = {
  email: 'alll.com',
  name: 'test',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const invalidLocationPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'test',
  slackUrl: 'ACME.slack.com',
  location: '@%'
};

export const invalidDeptNamePayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: '  ',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const numericDeptNamePayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: '1111111',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const missingDeptNamePayload = {
  email: 'test.test@test.com',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const validDeptPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'tembea',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const existingDeptPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'tembea',
  slackUrl: 'ACME.slack.com',
  location: 'Nairobi'
};

export const numericLocationPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'TDD7',
  slackUrl: 'ACME.slack.com',
  location: '65656464'
};

export const missingDeptLocationPayload = {
  email: 'test.test@test.com',
  name: 'TDD',
  slackUrl: 'ACME.slack.com',
  location: ''
};
