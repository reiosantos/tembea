const startDate = 'AAAAAA';
const endDate = 'BBBBBB';
const workHours = 'CCC-DDD';
const id = 12;

const providerUserDetails = {
  id: 1,
  name: 'Andela Kenya',
  providerUserId: 15
};
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
  reviewerEmail: 'test.buddy2@andela.com',
  provider: providerUserDetails
};
export const mockDeclinedRouteRequest = {
  newOpsStatus: 'decline',
  comment: 'some comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  provider: providerUserDetails
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
  teamUrl: 'tembea.slack.com',
  provider: providerUserDetails
};
export const mockDataInvalidCapacity = {
  newOpsStatus: 'approve',
  comment: 'comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  routeName: 'ParksWay',
  takeOff: '2:30',
  provider: {}
};

export const mockDataInvalidTakeOffTime = {
  newOpsStatus: 'approve',
  comment: 'comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  routeName: 'ParksWay',
  capacity: '2',
  takeOff: 'Take Off',
  provider: providerUserDetails
};

export const mockDataCorrectRouteRequest = {
  newOpsStatus: 'approve',
  comment: 'some comment',
  reviewerEmail: 'test.buddy2@andela.com',
  teamUrl: 'tembea.slack.com',
  routeName: 'ParksWay',
  capacity: '2',
  takeOff: '9:30',
  provider: providerUserDetails
};

export const mockCabsData = {
  cabs: [
    {
      driverName: 'Dominic Toretto',
      driverPhoneNo: '1-219-560-3666',
      regNumber: 'SMK 319 JK',
      capacity: 4,
      model: 'subaru',
      providerId: 1,
      location: 'Lagos'
    },
    {
      driverName: "Brian O'Conner",
      driverPhoneNo: '(137) 416-5270 x302',
      regNumber: 'LND 419 CN',
      capacity: 4,
      model: 'toyota',
      providerId: 1,
      location: 'Wakanda'
    },
    {
      driverName: 'Tej Parker',
      driverPhoneNo: '1-176-388-3792 x715',
      regNumber: 'IKR 409 KI',
      capacity: 8,
      model: 'toyota',
      providerId: 1,
      location: 'Kampala'
    },
    {
      driverName: 'Luke Hobbs',
      driverPhoneNo: '051-799-5051',
      regNumber: 'APP 519 DT',
      capacity: 4,
      model: 'prado',
      providerId: 2,
      location: 'Nairobi'
    }
  ],
  cabsFiltered: [
    {
      driverName: 'Dominic Toretto',
      driverPhoneNo: '1-219-560-3666',
      regNumber: 'SMK 319 JK',
      capacity: 4,
      model: 'subaru',
      providerId: 1,
      location: 'Lagos'
    },
    {
      driverName: "Brian O'Conner",
      driverPhoneNo: '(137) 416-5270 x302',
      regNumber: 'LND 419 CN',
      capacity: 4,
      model: 'toyota',
      providerId: 1,
      location: 'Wakanda'
    }
  ],
  mockCabUpdateData: {
    driverName: 'Muhwezi Deo'
  }
};

export const routeData = {
  id: 1,
  batchUseDate: '2018-05-03',
  batch: {
    id: 1001,
    takeOff: '09:50',
    status: 'Activ',
    comments: 'Went to the trip',
    routeId: 1001,
    cabId: 10,
    cabDetails: {
      driverName: 'Kafuuma Henry',
      driverPhoneNo: 256772312456,
      regNumber: 'UBE321A'
    },
    route: {
      routeId: 1001,
      name: 'Hoeger Pine',
      destination: {
        locationId: 1002,
        address: '629 O\'Connell Flats'
      }
    }
  }
};

export const data = {
  id: 2,
  userId: 15,
  batchRecordId: 2,
  userAttendStatus: 'NotConfirmed',
  reasonForSkip: null,
  rating: null,
  user: {
    id: 15,
    name: 'Ronald Okello',
    slackId: 'UG93CNE',
    email: 'ronald.okello@andela.com'
  },
  routeUseRecord: {
    id: 2,
    departureDate: '2019-04-03 03:00',
    routeId: 1002,
    batch: {
      batchId: 1003,
      takeOff: '03:00',
      status: 'Active',
      comments: 'Consequatur cumque est veritatis unde quae.'
    },
    cabDetails: {
      cabId: 1,
      driverName: 'Dominic Toretto',
      driverPhoneNo: '(566) 790-4855',
      regNumber: 'SMK 319 JK'
    }
  }
};

export const mockReturnedCountryData = {
  name: 'Kenya',
  topLevelDomain: [
    '.ke'
  ],
  alpha2Code: 'KE',
  alpha3Code: 'KEN',
  callingCodes: [
    '254'
  ],
  capital: 'Nairobi',
  altSpellings: [
    'KE',
    'Republic of Kenya',
    'Jamhuri ya Kenya'
  ],
  region: 'Africa',
  subregion: 'Eastern Africa',
  population: 47251000,
  latlng: [
    1,
    38
  ]
};

export const mockCountryError = {
  status: 404,
  message: 'Country not found'
};

export const mockNewHomebase = {
  dataValues: [{
    id: 1,
    name: 'Nairobi',
    countryId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z',
    deletedAt: null
  }],
  _options: {
    isNewRecord: true
  }
};

export const mockCreatedHomebase = {
  homebase: [{
    id: 1,
    name: 'Nairobi',
    countryId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z',
    deletedAt: null
  }],
  isNewHomebase: true
};

export const mockCountry = {
  id: 1,
  name: 'Kenya',
  status: 'Active',
  createdAt: '2019-04-01T12:07:13.002Z',
  updatedAt: '2019-04-01T12:07:13.002Z'
};

export const mockExistingHomebase = {
  homebase: {
    id: 1,
    name: 'Nairobi',
    countryId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z'
  },
  isNewHomeBase: false
};

export const mockGetCabsData = {
  pageMeta: {
    totalPages: 1,
    page: 1,
    totalResults: 3,
    pageSize: 100
  },
  data: [
    {
      id: 1,
      name: 'Uber Kenya',
      providerUserId: 1,
      user: {
        name: 'John smith',
        phoneNo: null,
        email: 'john.smith@gmail.com'
      }
    },
    {
      id: 2,
      name: 'Taxify Kenya',
      providerUserId: 2,
      user: {
        name: 'Derrick jones',
        phoneNo: null,
        email: 'derrick.jones@gmail.com'
      }
    },
    {
      id: 3,
      name: 'Endesha Kenya',
      providerUserId: 3,
      user: {
        name: 'Abishai Omari',
        phoneNo: null,
        email: 'abishai.omari@andela.com'
      }
    }
  ]
};

export const mockCreatedProvider = [{
  dataValues: {
    id: 1,
    name: 'Uber Kenya',
    providerUserId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z',
    deletedAt: null
  },
  _options: {
    isNewRecord: true
  }
}];

export const mockReturnedProvider = {
  provider: {
    id: 1,
    name: 'Uber Kenya',
    providerUserId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z',
    deletedAt: null
  },
  isNewProvider: true
};

export const mockProvider = {
  provider: {
    id: 1,
    name: 'Uber Kenya',
    providerUserId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z'
  }
};

export const mockExistingProvider = {
  provider: {
    id: 1,
    name: 'Uber Kenya',
    providerUserId: 1,
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z',
    deletedAt: null
  },
  isNewProvider: false
};

export const mockUser = {
  id: 1,
  name: 'Allan Mogusu'
};

export const mockHomebaseResponse = {
  totalPages: 1,
  homebases: [{
    id: 1,
    homebaseName: 'Nairobi',
    country: 'Kenya',
    createdAt: '2019-05-05T10:57:31.476Z',
    updatedAt: '2019-05-05T10:57:31.476Z'
  },
  {
    id: 2,
    homebaseName: 'Kampala',
    country: 'Uganda',
    createdAt: '2019-05-05T10:57:31.476Z',
    updatedAt: '2019-05-05T10:57:31.476Z'
  }
  ],
  pageNo: 1,
  totalItems: 2,
  itemsPerPage: 10
};

export const mockGetHomebaseResponse = {
  totalPages: 1,
  homebases: [{
    id: 1,
    homebaseName: 'Nairobi',
    country: 'Kenya',
    createdAt: '2019-05-05T10:57:31.476Z',
    updatedAt: '2019-05-05T10:57:31.476Z'
  }
  ],
  pageNo: 1,
  totalItems: 1,
  itemsPerPage: 10
};
