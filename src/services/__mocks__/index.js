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
  routeRequest: {
    dataValues: {
      id: 12,
      status: 'Pending',
      managerComment: 'ZZZZZZZ',
      opsComment: 'XXXXXX',
      routeImageUrl: 'Pending',
      distance: 3.02,
      busStopDistance: 1.02,
    },
    botToken: 'XXXXXXXXX'
  },
  dataValues: {
    id: 12,
    status: 'Pending',
    managerComment: 'ZZZZZZZ',
    opsComment: 'XXXXXX',
    routeImageUrl: 'Pending',
    distance: 3.02,
    busStopDistance: 1.02,
  },
  id: 12,
  status: 'Pending',
  managerComment: 'Z',
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
  imageUrl: 'IIIIII',
  takeOff: 'Pending',
  capacity: 3,
  comments: 'AAAAAA',
  destination: 'AAAAAA',
  inUse: 'AAAAAA',
};

const riders = [{ email: 'AAA.BBB@CCC.DDD', slackId: 'ABCDEF', id: 123 }];
const destination = { id: 456, address: 'BBBBBB' };
const route = {
  name: 'ZZZZZZ', imageUrl: 'https://image-url', destination, routeBatch: [{ batch: 'A' }]
};
const cabDetails = {
  driverName: 'AAAAAA', driverPhoneNo: '+123456789', regNumber: 'CCCCCC'
};
const batchDetails = {
  inUse: 1,
  batch: 'A',
  capacity: 1,
  takeOff: 'DD:DD',
  comments: 'EEEEEE',
  imageUrl: 'https://image-url',
  status: 'Active',
};

export const departmentMocks = [
  {
    dataValues: {
      name: 'Mathematics',
      id: 1,
      head: {
        dataValues: {
          id: 1
        }
      }
    }
  }
];
export const mockRouteBatchData = {
  cabDetails, route, riders, ...batchDetails
};
export const mockDataMissingTeamUrl = {
  newOpsStatus: 'decline',
  comment: 'some comment',
  reviewerEmail: 'test.buddy2@andela.com'
};
export const mockDeclinedRouteRequest = {
  newOpsStatus: 'decline',
  comment: 'some comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com'
};
export const mockDataMissingParams = {
  newOpsStatus: 'approve',
  comment: 'some comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'andela.slack.com'
};
export const mockDataInvalidComment = {
  newOpsStatus: 'decline',
  comment: 'some = comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com'
};
export const mockDataInvalidCapacity = {
  newOpsStatus: 'approve',
  comment: 'comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  routeName: 'ParksWay',
  capacity: 'capacity',
  takeOff: '2:30',
  cabRegNumber: 'KCX XXX0'
};

export const mockDataInvalidTakeOffTime = {
  newOpsStatus: 'approve',
  comment: 'comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  routeName: 'ParksWay',
  capacity: '2',
  takeOff: 'Take Off',
  cabRegNumber: 'KCX XXX0'
};

export const mockDataCorrectRouteRequest = {
  newOpsStatus: 'approve',
  comment: 'some comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  routeName: 'ParksWay',
  capacity: '2',
  takeOff: '9:30',
  cabRegNumber: 'KCX XXX0'
};
