module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Departments', [{
    name: 'TDD',
    headId: 3,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  }, {
    name: 'Travel',
    headId: 4,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  }, {
    name: 'People',
    headId: 6,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Pre-Fellowship',
    headId: 6,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'D0 Programs',
    headId: 5,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'D1+ Programs',
    headId: 4,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Success',
    headId: 6,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Operations',
    headId: 5,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Technology',
    headId: 4,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'IT',
    headId: 6,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Developer Marketing',
    headId: 3,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Partner Marketing',
    headId: 6,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Communications',
    headId: 4,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Creative Team',
    headId: 5,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Recruitment',
    headId: 4,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Partnerships',
    headId: 6,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Sales',
    headId: 3,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Partner Experience',
    headId: 4,
    teamId: 'TEAMID2',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Launchpad',
    headId: 6,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Finance',
    headId: 6,
    teamId: 'TE2K8PGF8',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  },
  {
    name: 'Technical',
    headId: 7,
    teamId: 'TCPCFU4RF',
    createdAt: '2018-11-28',
    updatedAt: '2018-11-28'
  }], {}),
  down: queryInterface => queryInterface.bulkDelete('Departments', null, {})
};
