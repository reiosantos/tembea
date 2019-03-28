export const tripsMock = () => [{
  id: 4,
  name: 'my trip home',
  status: 'Confirmed',
  arrivalTime: null,
  type: 'Regular Trip',
  passenger: undefined,
  requestedOn: new Date('2015-02-02'),
  departureTime: '2016-02-02T17:00:00.000Z',
  department: 'TDD',
  destination: 'Epic Tower',
  pickup: 'the dojo',
  decliner: undefined,
  rider:
   {
     name: 'Oluwatominiyin Adebanjo',
     email: 'oluwatominiyin.adebanjo@andela.com',
     slackId: 'UE144LRAQ'
   },
  requester:
   {
     name: 'Vic',
     email: 'onwuzorvictor@outlook.com',
     slackId: 'UCQ4TN2PP'
   },
  approvedBy: {},
  confirmedBy: {}
}];

export const tripsMock2 = [{
  id: 4,
  name: 'my trip home',
  status: 'Confirmed',
  arrivalTime: null,
  type: 'Regular Trip',
  passenger: undefined,
  requestedOn: new Date(),
  departureTime: '2016-02-02T17:00:00.000Z',
  department: 'TDD',
  destination: 'Epic Tower',
  pickup: 'the dojo',
  decliner: undefined,
  rider:
     {
       name: 'Oluwatominiyin Adebanjo',
       email: 'oluwatominiyin.adebanjo@andela.com',
       slackId: 'UE144LRAQ'
     },
  requester:
     {
       name: 'Vic',
       email: 'onwuzorvictor@outlook.com',
       slackId: 'UCQ4TN2PP'
     },
  approvedBy: {},
  confirmedBy: {}
}];

export const departmentsMock = [{
  id: 23,
  name: 'tembea',
  headId: 6,
  teamId: 'TEAMID2',
  status: 'Active',
  location: 'Nairobi',
  'head.id': 6,
  'head.name': 'Opeoluwa Iyi-Kuyoro',
  'head.slackId': 'UE1920ZNW',
  'head.phoneNo': null,
  'head.email': 'opeoluwa.iyi-kuyoro@andela.com',
  'head.defaultDestinationId': null,
  'head.routeBatchId': null,
}];

export const routesMock = [{
  id: 1001,
  status: 'Active',
  imageUrl: undefined,
  takeOff: '03:00',
  capacity: 5,
  batch: 'A',
  comments: 'Nemo aut vero et aliquam reprehenderit.',
  routeId: 1007,
  inUse: 5,
  name: 'Franecki Park',
  destination: '253 Graham Pike',
  driverName: 'Dominic Toretto',
  driverPhoneNo: '1-191-775-5335',
  regNumber: 'SMK 319 JK'
}];

export const dataFromDBMock = {
  data: [
    {
      id: 1001,
      status: 'Active',
      takeOff: '03:00',
      capacity: 5,
      batch: 'A',
      comments: 'Nemo aut vero et aliquam reprehenderit.',
      routeId: 1007,
      inUse: 5,
      name: 'Franecki Park',
      destination: '253 Graham Pike',
      driverName: 'Dominic Toretto',
      driverPhoneNo: '1-191-775-5335',
      regNumber: 'SMK 319 JK'
    },
    {
      id: 1002,
      status: 'Active',
      takeOff: '03:00',
      capacity: 6,
      batch: 'A',
      comments: 'Earum laudantium non autem.',
      routeId: 1006,
      inUse: 1,
      name: 'Gottlieb Key',
      destination: '86537 Green Rapid',
      driverName: 'Tej Parker',
      driverPhoneNo: '697-635-3947 x980',
      regNumber: 'IKR 409 KI'
    }
  ],
  columns: [
    {
      id: 'name', header: 'Name', width: 120, height: 40
    },
    {
      id: 'batch', header: 'Batch', width: 65, height: 40
    },
    {
      id: 'takeOff', header: 'TakeOff Time', width: 65, height: 40
    },
    {
      id: 'capacity', header: 'Capacity', width: 65, height: 40
    },
    {
      id: 'inUse', header: 'In Use', width: 65, height: 40
    },
    {
      id: 'regNumber', header: 'Vehicle', width: 120, height: 40
    },
    {
      id: 'status', header: 'Status', width: 65, height: 40
    }
  ],
  margins: {
    margins: {
      top: 40, bottom: 40, left: 25, right: 30
    }
  }
};

export const columns = [
  {
    id: 'requestedOn',
    header: 'Requested On',
    width: 85,
    height: 40
  },
  {
    id: 'departureTime',
    header: 'Departing On',
    width: 85,
    height: 40
  },
  {
    id: 'pickup', header: 'Pickup', width: 73, height: 40
  },
  {
    id: 'destination',
    header: 'Destination',
    width: 73,
    height: 40
  },
  {
    id: 'requester', header: 'Requested By', width: 73, height: 40
  },
  {
    id: 'department', header: 'Department', width: 85, height: 40
  },
  {
    id: 'rider', header: 'Rider', width: 73, height: 40
  },
  {
    id: 'cost', header: 'Cost', width: 73, height: 40
  },
  {
    id: 'approvedBy', header: 'Approved By', width: 73, height: 40
  },
  {
    id: 'confirmedBy',
    header: 'Confirmed By',
    width: 73,
    height: 40
  }
];

export const columnHeaders = [
  'requestedOn',
  'departureTime',
  'pickup',
  'destination',
  'requester',
  'department',
  'rider',
  'cost',
  'approvedBy',
  'confirmedBy'
];

export const pendingTripData = {
  id: 11,
  name: 'my trip to the Airport',
  status: 'Pending',
  arrivalTime: null,
  type: 'Regular Trip',
  passenger: undefined,
  departureTime: 'Thu Dec 21 2017 14:00:15 GMT+0300 (East Africa Time)',
  requestedOn: 'Wed Nov 14 2018 03:00:00 GMT+0300 (East Africa Time)',
  department: 'Operations',
  destination: 'the dojo',
  pickup: 'Epic Tower',
  flightNumber: undefined,
  decliner: undefined,
  rider: 'Oluwatominiyin Adebanjo',
  requester: 'Test Buddy1',
  approvedBy: 'None',
  confirmedBy: 'None'
};

export const filteredData = {
  'Requested On': 'Wed Nov 14 2018 03:00:00 GMT+0300 (East Africa Time)',
  'Departure Time': 'Thu Dec 21 2017 14:00:15 GMT+0300 (East Africa Time)',
  Pickup: 'Epic Tower',
  Destination: 'the dojo',
  Requester: 'Test Buddy1',
  Department: 'Operations',
  Rider: 'Oluwatominiyin Adebanjo',
  Cost: undefined,
  'Approved By': 'None',
  'Confirmed By': 'None'
};

export const newFormedData = [
  {
    'Requested On': 'Wed Nov 14 2018 03:00:00 GMT+0300 (East Africa Time)',
    'Departure Time': 'Thu Dec 21 2017 14:00:15 GMT+0300 (East Africa Time)',
    Pickup: 'Epic Tower',
    Destination: 'the dojo',
    Requester: 'Test Buddy1',
    Department: 'Operations',
    Rider: 'Oluwatominiyin Adebanjo',
    Cost: undefined,
    'Approved By': 'None',
    'Confirmed By': 'None'
  }
];

export const listOfDataObj = [
  {
    id: 11,
    name: 'my trip to the Airport',
    status: 'Pending',
    arrivalTime: null,
    type: 'Regular Trip',
    passenger: undefined,
    departureTime: 'Thu Dec 21 2017 14:00:15 GMT+0300 (East Africa Time)',
    requestedOn: 'Wed Nov 14 2018 03:00:00 GMT+0300 (East Africa Time)',
    department: 'Operations',
    destination: 'the dojo',
    pickup: 'Epic Tower',
    flightNumber: undefined,
    decliner: undefined,
    rider: 'Oluwatominiyin Adebanjo',
    requester: 'Test Buddy1',
    approvedBy: 'None',
    confirmedBy: 'None'
  }
];
