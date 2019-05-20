const providers = {
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
        }],
  totalPages: 1,
  pageNo: 1,
  totalItems: 1,
  itemsPerPage: 3
};
const successMessage = '1 of 1 page(s).';
const paginatedData = {
  pageMeta: {
    page: '1',
    pageSize: 3
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

const returnedData = {
  pageMeta: {
    page: '1',
    pageSize: 3
  },
  providers: [
    {
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
    }
  ]
};


export {
  providers, paginatedData, successMessage, returnedData
};
