const startDate = 'AAAAAA';
const endDate = 'BBBBBB';
const workHours = 'CCC-DDD';
const id = 12;

const fellow = {
  id: 1,
  slackId: 'FFFFFF',
  email: 'BBBBBB.CCCCCC@localhost'
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
    email: 'AAAAAA.BBBBBB@localhost',
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
    startDate: '2018-01-30T23:00:00.000Z',
    endDate: '2019-01-30T23:00:00.000Z',
    workHours: '20:00 - 1:20',
    fellow,
    partner
  }
};
export const mockRouteData = {
  id: 12,
  status: 'Inactive',
  vehicle: 'ZZZZZZZ',
  name: 'XXXXXX',
  takeOff: 'Pending',
  capacity: 3,
  comments: 'AAAAAA',
  destination: 'AAAAAA',
  inUse: 'AAAAAA',
};

export const routeServicesMockData = {
  cacheData: {
    firstRoute: {
      route: {
        id: 12,
        name: 'c',
        destinationid: 1,
        routeBatch: [{ batch: 'C' }],
        riders: [{}, {}, {}, {}],
        capacity: 4
      },

    },
    routeTwo: {
      name: 'Anthony way',
      vehicleRegNumber: 'EWER 109',
      destinationName: 'maryland mail bus stop',
      batchDetails: {
        id: 2,
        batch: ''
      }
    },
    data: {
      id: 1,
      update: jest.fn()
    },
    routeBatch: {
      count: 100,
      rows: [{}],
    },
    routeData: {
      cabDetails: {
        driverName: 'John P',
        driverPhoneNo: '09000000000',
        regNumber: 'TRUMP 1009'
      },
      route: {
        name: 'Yaba',
        destination: 'Anthony way',
        address: '21 house on jaja road',
      },
      riders: [{}, {}],
      id: 1,
      status: 'Active',
      takeOff: '07:08 PM',
      capacity: 4,
      batch: 'C'
    }
  }
};
