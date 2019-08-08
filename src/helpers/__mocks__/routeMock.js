const singleRouteDetails = {
  id: 1003,
  name: "O'Conner Roads",
  imageUrl: null,
  destination: {
    id: 1003,
  }
};

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
  route: singleRouteDetails
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

const LocationCoordinates = {
  lat: '1.34243535',
  lng: '-1.32424324'
};

const returnedLocation = {
  id: 1,
  latitude: '1.34243535',
  longitude: '-1.34243535',
  createdAt: '2019-05-09 13:00:00.326+03',
  updatedAt: '2019-05-09 13:00:00.326+03'
};

const returnedAddress = {
  id: 1,
  address: 'Andela Kenya',
  location: {
    latitude: '-1.34243535',
    longitude: '1.34243535'
  },
  createdAt: '2019-05-09 13:00:00.326+03',
  updatedAt: '2019-05-09 13:00:00.326+03',
};

const returnedSingleRoute = [{ ...singleRouteDetails }];

const newRouteWithBatchData = {
  routeName: 'Old Town Road',
  destination: {
    address: 'Roysambu Stage',
    coordinates: {
      lat: '-12.3242343',
      lng: '98.34324342'
    },
    takeOffTime: '11:30',
    capacity: 10,
    providerId: 1,
    imageUrl: 'this-url'
  }
};

export {
  routeBatch, batch, routeDetails, returnNullPercentage, record, returnedPercentage, confirmedRecord
  , percentagesList, singlePercentageArray, returnedMaxObj, returnedMinObj, emptyRecord, routeResult
  , LocationCoordinates, returnedLocation, returnedAddress, newRouteWithBatchData
  , singleRouteDetails, returnedSingleRoute
};
