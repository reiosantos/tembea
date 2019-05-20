const returnedObj = {
  pageMeta: {
    totalPages: 1, page: 1, totalResults: 3, pageSize: 100
  },
  providers:
        [{
          id: 1,
          name: 'Uber Kenya',
          providerUserId: 1,
          deletedAt: null,
          user: {
            id: 1,
            name: 'John smith',
            slackId: '345qq',
            phoneNo: null,
            email: 'john.smith@gmail.com',
            defaultDestinationId: null,
            routeBatchId: null,
            createdAt: '2018-11-14T00:00:00.000Z',
            updatedAt: '2018-11-14T00:00:00.000Z'
          }
        }]
};

const enteredProvider = [{
  id: 1,
  name: 'Uber Kenya',
  providerUserId: 1,
  deletedAt: null,
  user:
    {
      id: 1,
      name: 'John smith',
      slackId: '345qq',
      phoneNo: null,
      email: 'john.smith@gmail.com',
      defaultDestinationId: null,
      routeBatchId: null,
      createdAt: '2018-11-14T00:00:00.000Z',
      updatedAt: '2018-11-14T00:00:00.000Z'
    }
}];

export { returnedObj, enteredProvider };
