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

export const departmentAnalytics = [
  {
    id: 1,
    departmentId: 2,
    totalTrips: 2,
    totalCost: 6000,
    averageRating: 3.5,
    Department: { name: 'TDD' }
  },
  {
    id: 3,
    departmentId: 3,
    totalTrips: 1,
    totalCost: 6000,
    averageRating: 2,
    Department: { name: 'Travel' }
  }
];

export const result = {
  data: [{
    Department: { name: 'TDD' }, averageRating: 3.5, departmentId: 2, id: 1, totalCost: 6000, totalTrips: 2
  }, {
    Department: { name: 'Travel' }, averageRating: 2, departmentId: 3, id: 3, totalCost: 6000, totalTrips: 1
  }]
};


export const queryAnalyticsData = {
  startDate: '2018-11-14',
  endDate: '2018-11-25',
  departments: ['people', 'tdd', 'travel', 'success']
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
