const countryMock = {
  id: 1,
  name: 'Kenya',
  status: 'Active',
  createdAt: '2019-04-01T12:07:13.002Z',
  updatedAt: '2019-04-01T12:07:13.002Z'
};

const deletedCountryMock = {
  id: 1,
  name: 'Kenya',
  status: 'Inactive',
  createdAt: '2019-04-01T12:07:13.002Z',
  updatedAt: '2019-04-01T12:07:13.002Z'
};

const mockError = {
  error: {
    status: 404,
    message: 'Country was not found'
  },
};
const mockAPIFail = {
  name: 'RequestError',
  error: 'Could not find this address'
};

export {
  countryMock, deletedCountryMock, mockError, mockAPIFail
};
