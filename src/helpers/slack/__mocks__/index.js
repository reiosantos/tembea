
export const departmentMocks = [
  {
    dataValues: {
      name: 'Mathematics',
      id: 1,
      head: {
        dataValues: {}
      }
    }
  }
];

export const testUserFromDb = { dataValues: { id: 45, slackId: 'U4500' } };

export const slackUserMock = {
  real_name: 'dummyReal',
  profile: { email: 'dummyReal@local.host' },
  id: 'U4500'
};

export const testTripFromDb = {
  dataValues: {
    tripStatus: 'Approved',
    approvedById: testUserFromDb.dataValues.slackId
  },
  update: () => Promise.resolve(true)
};

export const testDepartmentFromDb = {
  dataValues: {
    id: 1,
    name: 'SWAT',
    head: testUserFromDb
  }
};
