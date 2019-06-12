const route = {
  id: 25,
  batchId: 1025,
  confirmedUsers: 0,
  unConfirmedUsers: 1,
  skippedUsers: 0,
  pendingUsers: 0,
  batchUseDate: '2019-06-14',
  createdAt: '2019-06-12T14:08:35.525Z',
  updatedAt: '2019-06-12T15:09:34.140Z',
  batch:
      {
        id: 1025,
        inUse: 3,
        takeOff: '03:00',
        batch: 'E',
        capacity: 7,
        status: 'Active',
        comments: 'Omnis officiis veniam.',
        createdAt: '2019-06-12T14:07:50.851Z',
        updatedAt: '2019-06-12T14:07:50.851Z',
        deletedAt: null,
        routeId: 1008,
        cabId: 1
      }
};

const data = {
  id: 1107,
  name: 'Cecelia Dach',
  slackId: '6eb8ab83-d3a8-43a4-8483-df81eda7e0a4',
  phoneNo: null,
  email: 'Piper78@gmail.com',
  defaultDestinationId: null,
  routeBatchId: 1015,
  createdAt: '2019-06-12T14:07:50.851Z',
  updatedAt: '2019-06-12T14:07:50.851Z'
};
const recordData = {
  id: 1,
  userId: 2,
  batchRecordId: 3,
  userAttendStatus: 'Confirmed',
  reasonForSkip: '',
  rating: 4,
  createdAt: '',
  updatedAt: '',
  user: {
    id: 1107,
    name: 'Cecelia Dach',
    slackId: '6eb8ab83-d3a8-43a4-8483-df81eda7e0a4',
    email: 'Piper78@gmail.com',
    routeBatchId: 1015
  },
  routeUseRecord: {
    id: 1107,
    name: 'Cecelia Dach',
    slackId: '6eb8ab83-d3a8-43a4-8483-df81eda7e0a4',
    phoneNo: null,
    email: 'Piper78@gmail.com',
    defaultDestinationId: null,
    routeBatchId: 1015,
    createdAt: '2019-06-12T14:07:50.851Z',
    updatedAt: '2019-06-12T14:07:50.851Z'
  },
};

export { route, data, recordData };
