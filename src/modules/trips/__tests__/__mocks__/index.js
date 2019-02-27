const mockedValue = {
  routes: [
    {
      name: 'my trip to the dojo',
      status: 'DeclinedByManager',
      arrivalTime: null,
      type: 'Regular Trip',
      departureTime: '2018-11-16T06:30:00.000Z',
      requestedOn: '2018-12-03T00:00:00.000Z',
      department: 'People',
      destination: 'the dojo',
      pickup: 'the dojo',
      rider: {
        name: 'Opeoluwa Iyi-kuyoro',
        email: 'opeoluwa.iyi-kuyoro@andela.com',
        slackId: 'UE1920ZNW'
      },
      requester: {
        name: 'Opeoluwa Iyi-kuyoro',
        email: 'opeoluwa.iyi-kuyoro@andela.com',
        slackId: 'UE1920ZNW'
      }
    }
  ]
};
const tripInfo = {
  dataValues: {
    name: 'Kico',
    tripStatus: 'Confirm',
    departureTime: new Date(),
    arrivalTime: new Date(),
    createdAt: new Date(),
    tripType: 'A',
    noOfPassenger: 8
  }
};
const resultValue = {
  data: {
    pageMeta: {
      page: 1,
      pageSize: 100,
      totalPages: 2,
      totalResults: 1,
    },
  },
  message: '1 of 2 page(s).',
  success: true
};
const response = {
  status: jest
    .fn(() => ({
      json: jest.fn(() => {})
    }))
    .mockReturnValue({ json: jest.fn() })
};
export {
  mockedValue, resultValue, response, tripInfo
};
