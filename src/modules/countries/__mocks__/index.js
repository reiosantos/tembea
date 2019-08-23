export const mockCountryCreationResponse = {
  countries: [
    {
      id: 1,
      name: 'Kenya',
      status: 'Active',
      createdAt: '2019-04-01T12:07:13.002Z',
      updatedAt: '2019-04-01T12:07:13.002Z'
    }
  ]
};

export const mockReturnedCountryData = {
  _options: {
    isNewRecord: true
  },
  dataValues: {
    id: 1,
    name: 'Kenya',
    status: 'Active',
    createdAt: '2019-04-01T12:07:13.002Z',
    updatedAt: '2019-04-01T12:07:13.002Z'
  }
};

export const response = {
  status: jest
    .fn(() => ({
      json: jest.fn(() => {})
    }))
    .mockReturnValue({ json: jest.fn() })
};

export const mockUpdatedData = {
  id: 1,
  name: 'Uganda',
  status: 'Active',
  createdAt: '2019-04-01T12:07:13.002Z',
  updatedAt: '2019-04-01T12:07:13.002Z'
};

export const mockCountryDetails = {
  id: 1,
  name: 'Uganda',
  status: 'Active',
  createdAt: '2019-04-01T12:07:13.002Z',
  updatedAt: '2019-04-01T12:07:13.002Z',
  count: 1,
  rows: 1
};

export const mockCountryZeroRow = {
  id: 1,
  name: 'Uganda',
  status: 'Active',
  createdAt: '2019-04-01T12:07:13.002Z',
  updatedAt: '2019-04-01T12:07:13.002Z',
  count: 1,
  rows: 0
};

export const mockNewCountry = {
  country: [
    {
      id: 1,
      name: 'Kenya',
      status: 'Active',
      createdAt: '2019-04-01T12:07:13.002Z',
      updatedAt: '2019-04-01T12:07:13.002Z'
    }
  ],
  isNewCountry: true
};

export const mockExistingCountry = {
  country: [
    {
      id: 1,
      name: 'Kenya',
      status: 'Active',
      createdAt: '2019-04-01T12:07:13.002Z',
      updatedAt: '2019-04-01T12:07:13.002Z'
    }
  ],
  isNewCountry: false
};
export const mockCreateCountry = {
  name: 'Create Country'
};
export const mockDeleteCountry = {
  name: 'Ghana'
};

export const mockUpdateCountry = {
  name: 'Create Country',
  newName: 'Ghana'
};
