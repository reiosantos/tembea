const startDate = 'AAAAAA';
const endDate = 'BBBBBB';
const workHours = 'CCC-DDD';
const id = 12;

const fellow = {
  id: 1,
  slackId: 'FFFFFF',
  email: 'BBBBBB@localhost'
};
const partner = {
  name: 'GGGGGG',
  id: 1
};
const fellowId = fellow.id;
const partnerId = partner.id;

const updateStartDate = 'AAAAAA';
const updateEndDate = 'BBBBBB';
const updateWorkHours = 'CCC-DDD';
export const engagement = {
  id,
  startDate,
  endDate,
  workHours,
  fellowId,
  partnerId,
  fellow,
  partner
};
export const updateEngagement = {
  ...engagement,
  startDate: updateStartDate,
  endDate: updateEndDate,
  workHours: updateWorkHours
};
export const mockRouteRequestData = {
  id: 12,
  status: 'Pending',
  managerComment: 'ZZZZZZZ',
  opsComment: 'XXXXXX',
  routeImageUrl: 'Pending',
  distance: 3.02,
  busStopDistance: 1.02,
  manager: {
    id: 1,
    slackId: 1,
    email: 'AAAAAA@localhost',
  },
  busStop: {
    id: 1,
    address: 'AAAAAA',
    locationId: 1
  },
  home: {
    id: 1,
    address: 'BBBBBB',
    locationId: 1
  },
  engagement: {
    id: 1,
    startDate: 'CCCCCC',
    endDate: 'DDDDDD',
    workHours: 'EEEEEE',
    fellow,
    partner
  }
};
