const dummyMockData = {
  destinationInfo: {
    busStop: { longitude: '1234', latitude: '3232', address: 'lagos' },
    homeAddress: { longitude: '1234', latitude: '3232', address: 'lagos' },
  },
  partnerInfo: {
    userId: '123NB',
    teamId: '23200',
    managerSlackId: '23200',
    partnerName: 'dummy partner',
    workingHours: '12:09 - 02:99',
  },
  depData: {
    engagement: { id: '1233' },
    manager: { id: '1233' },
    fellowBusStop: { id: '1233', address: 'lagos' },
    fellowHomeAddress: { id: '1233', address: 'lagos' }
  },
  locationInfo: {
    dojoToDropOffDistance: { distanceInMetres: 2000 },
    homeToDropOffDistance: { distanceInMetres: 2000 },
    staticMapUrl: 'http://dummymapurl.com/700*730, 36.886215'
  },
  cacheData: [{
    label: 'Bus and Matatu Park',
    text: 'Bus and Matatu Park',
    value: '-1.2329135,36.893683',
  }],
  engagementInfo: {
    manager: 1,
    nameOfPartner: 'Victor Chibuike LMT',
    workingHours: '02:09 - 07:33',
    fellow: 22,
  }
};

export default dummyMockData;
