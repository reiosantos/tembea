const routeBatch = {
  id: 1,
  takeOff: '03:00',
  capacity: 4,
  status: 'Active',
  routeId: 1003,
  cabId: 3,
  cabDetails: {
    id: 3,
    driverName: 'Tej Parker',
  },
  route: {
    id: 1003,
    name: "O'Conner Roads",
    imageUrl: null,
    destination: {
      id: 1003,
    }
  }
};

const batch = {
  id: 2,
  status: 'Active',
  takeOff: '03:00',
  capacity: 4,
  batch: 'B',
  comments: null,
  inUse: 0,
  name: "O'Conner Roads",
  destination: '17013 Misael Locks',
  driverName: 'Tej Parker',
  driverPhoneNo: '352.211.6285 x032',
  regNumber: 'IKR 409 KI'
};

const routeDetails = {
  route: {
    id: 1005,
    routeBatch: [
      {
        id: 1001,
        batch: 'A',
      },
      {
        id: 1021,
        batch: 'B',
      }
    ]
  },
  created: false
};

export {
  routeBatch, batch, routeDetails
};
