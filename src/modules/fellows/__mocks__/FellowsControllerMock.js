
export const data = [{
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
}];

export default data;
export const fellowMockData = {
  data:
       [{
         id: 4,
         name: 'Leon Kioko',
         slackId: 'UE0M46P3K',
         phoneNo: null,
         email: 'leon.kioko@andela.com',
         defaultDestinationId: null,
         routeBatchId: 1006,
         createdAt: 2018 - 11 - 27,
         updatedAt: 2018 - 11 - 27
       }],
  pageMeta: {
    totalPages: 5,
    currentPage: 1,
    limit: 1,
    totalItems: 5
  }
};

export const fellowMockData2 = {
  data:
       [{
         id: 4,
         name: 'Fabisch Apeli',
         slackId: 'UE0M46P3K',
         phoneNo: null,
         email: 'fabish.apeli@andela.com',
         defaultDestinationId: null,
         routeBatchId: null,
         createdAt: 2018 - 11 - 27,
         updatedAt: 2018 - 11 - 27
       }],
  pageMeta: {
    totalPages: 5,
    currentPage: 1,
    limit: 1,
    totalItems: 5
  }
};
export const fellows = {
  data: [],
  pageMeta: {
    totalPages: 0,
    currentPage: 1,
    limit: 100,
    totalItems: 0
  }
};
export const userMock = {
  userId: 4,
  totalTrips: 1,
  tripsTaken: 0
};
export const aisMock = {
  id: '-LWkHfEsK9RAUQ3HqEHF',
  email: 'leon.kioko@andela.com',
  first_name: 'Leon',
  last_name: 'Kioko',
  name: 'Leon Kioko',
  api_token: '',
  picture: 'https://lh3.googleusercontent.com/-3CusceYkki4/AAAAAAAAAAI/AAAAAAAAAAc/iR7Im4AaCRk/s50/photo.jpg',
  status: 'active',
  roles: [{
    id: '-KXH7iME4ebMEXAEc7HP',
    name: 'Technology'
  },
  {
    id: '-KiihfZoseQeqC6bWTau',
    name: 'Andelan'
  }
  ],
  cohort: null,
  location: null,
  level: null,
  slogan: '',
  known_as: '',
  bio: '',
  github: '',
  slack: 'Bileonaire',
  phone_number: '',
  organisation: null,
  progress: 0,
  access_token: '',
  placement: null,
  promotion: '',
  last_login: '2019-01-21T12:02:50.487Z',
  created_at: '2019-01-21T12:02:50.523Z',
  updated_at: '2019-04-03T09:33:01.506Z',
  greenhouse_id: 0,
  bamboo_hr_id: 0,
  department_name: '',
  job_name: '',
  offer_start_date: '2019-01-21T12:02:50.488Z',
  department: null
};
export const finalUserDataMock = {
  name: 'Leon Kioko',
  picture: 'https://lh3.googleusercontent.com/-3CusceYkki4/AAAAAAAAAAI/AAAAAAAAAAc/iR7Im4AaCRk/s50/photo.jpg',
  placement: null,
  userId: 4,
  totalTrips: 1,
  tripsTaken: 0
};
export const finallAllMock = [
  {
    name: 'Abishai Omari',
    picture: 'https://lh4.googleusercontent.com/-pyXopvRufc8/AAAAAAAAAAI/AAAAAAAAABA/fpFzU9w9Jj8/photo.jpg?sz=50',
    placement: null,
    userId: 3,
    totalTrips: 1,
    tripsTaken: 0
  },
  {
    name: 'Alex Kiura',
    picture: 'https://lh5.googleusercontent.com/-mkUgS35xWew/AAAAAAAAAAI/AAAAAAAAAAo/0hygaq-Wqes/photo.jpg?sz=50',
    placement: {
      id: '-LRpI517GlyGbWQbxeDy',
      client: '',
      type: 'recommendation',
      status: 'Internal Engagements - Technology',
      start_date: '2018-11-21T08:04:16.625Z',
      end_date: '',
      salesforce_id: '',
      updated_at: '2018-11-21T08:04:17.160Z',
      created_at: '2018-11-21T08:04:17.160Z',
      updated_by: 'Einstein Njoroge',
      next_available_date: '',
      client_id: ''
    },
    userId: 1,
    totalTrips: 1,
    tripsTaken: 0
  },
  {
    name: 'Oluwatominiyin Adebanjo',
    picture: 'https://lh4.googleusercontent.com/-2V0LKzG_Cpk/AAAAAAAAAAI/AAAAAAAAAAc/3kZrV_j_RIg/s50/photo.jpg',
    placement: null,
    userId: 5,
    totalTrips: 1,
    tripsTaken: 0
  },
  {
    name: 'Leon Kioko',
    picture: 'https://lh3.googleusercontent.com/-3CusceYkki4/AAAAAAAAAAI/AAAAAAAAAAc/iR7Im4AaCRk/s50/photo.jpg',
    placement: null,
    userId: 4,
    totalTrips: 1,
    tripsTaken: 0
  }
];
