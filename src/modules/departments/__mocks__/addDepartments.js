export const noUserPayload = {
  email: 'unKnownEmail@test.com',
  name: 'test',
  slackUrl: 'ACME.slack.com',
};

export const noEmailPayload = {
  name: 'test',
  slackUrl: 'ACME.slack.com',
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
    Department: { name: 'TDD' },
    averageRating: 3.5,
    departmentId: 2,
    id: 1,
    totalCost: 6000,
    totalTrips: 2
  }, {
    Department:
      { name: 'Travel' },
    averageRating: 2,
    departmentId: 3,
    id: 3,
    totalCost: 6000,
    totalTrips: 1
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
};

export const invalidLocationPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'test',
  slackUrl: 'ACME.slack.com',
  homebaseId: 1923
};

export const invalidDeptNamePayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: '  ',
  slackUrl: 'ACME.slack.com',
};

export const numericDeptNamePayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: '1111111',
  slackUrl: 'ACME.slack.com',
};

export const missingDeptNamePayload = {
  email: 'test.test@test.com',
  slackUrl: 'ACME.slack.com',
};

export const validDeptPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'tembea',
  slackUrl: 'ACME.slack.com',
};

export const existingDeptPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'tembea',
  slackUrl: 'ACME.slack.com',
};

export const numericLocationPayload = {
  email: 'opeoluwa.iyi-kuyoro@andela.com',
  name: 'TDD7',
  slackUrl: 'ACME.slack.com',
};
