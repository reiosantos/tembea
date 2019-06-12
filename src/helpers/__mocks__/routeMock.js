const routeBatch = {
  id: 1,
  takeOff: '03:00',
  capacity: 4,
  status: 'Active',
  routeId: 1003,
  cabId: 3,
  cabDetails: {
    id: 3,
    driverName: 'Tej Parker',
  },
  route: {
    id: 1003,
    name: "O'Conner Roads",
    imageUrl: null,
    destination: {
      id: 1003,
    }
  }
};

const batch = {
  id: 2,
  status: 'Active',
  takeOff: '03:00',
  capacity: 4,
  batch: 'B',
  comments: null,
  inUse: 0,
  name: "O'Conner Roads",
  destination: '17013 Misael Locks',
  driverName: 'Tej Parker',
  driverPhoneNo: '352.211.6285 x032',
  regNumber: 'IKR 409 KI'
};

const routeDetails = {
  route: {
    id: 1005,
    routeBatch: [
      {
        id: 1001,
        batch: 'A',
      },
      {
        id: 1021,
        batch: 'B',
      }
    ]
  },
  created: false
};

const returnNullPercentage = [{
  Route: 'Twila Centers', RouteBatch: 'B', percentageUsage: 0, users: 1
}];
const record = [{
  BatchUseRecordID: 3,
  userAttendStatus: 'NotConfirmed',
  RouteRecordID: 2,
  RouteBatchID: 1003,
  RouteBatchName: 'B',
  Route: 'Twila Centers',
  RouteID: 1006,
  batchUseDate: '2019-05-07'
}];
const returnedPercentage = [{
  Route: 'Twila Centers', RouteBatch: 'B', percentageUsage: 100, users: 1
}];
const confirmedRecord = [{
  BatchUseRecordID: 3,
  userAttendStatus: 'Confirmed',
  RouteRecordID: 2,
  RouteBatchID: 1003,
  RouteBatchName: 'B',
  Route: 'Twila Centers',
  RouteID: 1006,
  batchUseDate: '2019-05-07'
}];

const percentagesList = [{
  Route: 'Twila Centers',
  RouteBatch: 'A',
  users: 7,
  percentageUsage: 14
},
{
  Route: 'Twila Center',
  RouteBatch: 'B',
  users: 5,
  percentageUsage: 20
}];
const singlePercentageArray = [{
  Route: 'Twila Centers',
  RouteBatch: 'A',
  users: 7,
  percentageUsage: 14
}];
const returnedMaxObj = {
  Route: 'Twila Center',
  RouteBatch: 'B',
  users: 5,
  percentageUsage: 20
};
const returnedMinObj = {
  Route: 'Twila Centers',
  RouteBatch: 'A',
  users: 7,
  percentageUsage: 14
};
const emptyRecord = {
  Route: 'N/A',
  RouteBatch: '',
  percentageUsage: 0,
  users: 0
};

const routeResult = {
  totalPages: 1,
  pageNo: 1,
  itemsPerPage: 100,
  totalItems:
   [{
     inUse: '4',
     id: 1003,
     status: 'Active',
     capacity: 5,
     takeOff: '03:00',
     batch: 'B',
     comments: 'Voluptatem quos in.',
     count: '4',
   }],
  routes: [
    batch
  ]
};

export {
  routeBatch, batch, routeDetails, returnNullPercentage, record, returnedPercentage, confirmedRecord
  , percentagesList, singlePercentageArray, returnedMaxObj, returnedMinObj, emptyRecord, routeResult
};
