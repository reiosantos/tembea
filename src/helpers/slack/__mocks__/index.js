
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

export const createNewUserMock = {
  user: {
    real_name: 'dummyReal',
    profile: { email: 'dummyReal@local.host', real_name: 'dummyReal' },
    id: 'U4500'
  }
};

export const newUser = {
  real_name: 'santos',
  profile: { email: 'tembea@tem.com' },
  id: 'U4500'
};
