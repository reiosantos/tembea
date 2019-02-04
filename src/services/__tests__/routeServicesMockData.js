const routeServicesMockData = {
  cacheData: {
    firstRoute: {
      route: {
        id: 12,
        name: 'c',
        destinationid: 1,
        routeBatch: [{ batch: 'C' }],
        riders: [{}, {}, {}, {}],
        capacity: 4
      },

    },
    routeTwo: {
      name: 'Anthony way',
      vehicleRegNumber: 'EWER 109',
      destinationName: 'maryland mail bus stop',
      batchDetails: {
        id: 2,
        batch: ''
      }
    },
    data: {
      id: 1,
      update: jest.fn()
    },
    routeBatch: {
      count: 100,
      rows: [{}],
    },
    routeData: {
      cabDetails: {
        driverName: 'John P',
        driverPhoneNo: '09000000000',
        regNumber: 'TRUMP 1009'
      },
      route: {
        name: 'Yaba',
        destination: 'Anthony way',
        address: '21 house on jaja road',
      },
      riders: [{}, {}],
      id: 1,
      status: 'Active',
      takeOff: '07:08 PM',
      capacity: 4,
      batch: 'C'
    }
  }
};
export default routeServicesMockData;
