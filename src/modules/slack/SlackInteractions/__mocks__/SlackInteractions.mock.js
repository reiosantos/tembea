export const responseMessage = (text = 'Thank you for using Tembea') => ({
  as_user: false,
  user: undefined,
  attachments: undefined,
  channel: undefined,
  response_type: 'ephemeral',
  text
});

export const createPayload = (value = 'value', name = 'name') => ({
  actions: [{ value, name, selected_options: [{ value, name }] }],
  user: { id: 'dummyId' },
  team: { id: 'XXXXXXX' },
  channel: { id: 'ABCXYZ' },
  callback_id: `schedule_trip_${value}`,
  submission: {
    pickup: 'pickup',
    others_pickup: 'others_pickup',
    destination: 'destination',
    others_destination: 'others_destination',
    date_time: '10/10/2018 22:00',
    flightDateTime: '10/10/2018 22:00',
    embassyVisitDateTime: '10/10/2018 22:00',
    reason: 'test reason',
    pageNumber: 3,
    search: 'search parameter',
    flightNumber: '12345XYZ'
  }
});

export const createPickupPayload = (value = 'value', name = 'name') => ({
  actions: [{ value, name, selected_options: [{ value, name }] }],
  user: { id: 'dummyId' },
  team: { id: 'XXXXXXX' },
  callback_id: `schedule_trip_${value}`,
  submission: {
    pickup: 'pickup',
    othersPickup: 'others_pickup',
    date_time: '10/10/2018 22:00',
  }
});

export const createDestinationPayload = (value = 'value', name = 'name') => ({
  actions: [{ value, name, selected_options: [{ value, name }] }],
  user: { id: 'dummyId' },
  team: { id: 'XXXXXXX' },
  callback_id: `schedule_trip_${value}`,
  submission: {
    destination: 'destination',
    othersDestination: 'others_destination',
  }
});

export const createTripPayload = (value = 'value', name = 'name') => ({
  actions: [{ value, name, selected_options: [{ value, name }] }],
  user: { id: 'dummyId' },
  team: { id: 'XXXXXXX' },
  callback_id: `schedule_trip_${value}`,
  submission: {
    pickup: 'pickup',
    others_pickup: 'others_pickup',
    destination: 'destination',
    others_destination: 'others_destination',
    date_time: '10/10/2018 22:00',
    flightDateTime: '10/10/2018 22:00',
    reason: 'test reason',
  }
});

export const createTripData = () => ({
  forSelf: 'true',
  reason: 'hgjg',
  passengers: '1',
  department: { name: 'launchpad', type: 'button', value: '19' },
  id: 'UG9LLMA5R',
  name: 'dummy.name',
  pickup: 'andela',
  destination: 'bbbbbb',
  othersPickup: 'andela',
  dateTime: '22/12/2019 22:00',
  departmentId: '19',
  tripType: 'Regular Trip',
  tripDetails: {
    pickup: 'Others',
    othersPickup: 'andela',
  },
  pickupLat: '1.222222',
  destinationLat: '3.222222',
  pickupLong: '1.222222',
  destinationLong: '3.222222',
  pickUpAddress: {
    address: 'Andela Kenya, TRM Dr, Nairobi, Kenya',
    latitude: -1.2197531,
    longitude: 36.88588850000001,
  },
  destinationAddress: {
    address: 'Andela Kenya, TRM Dr, Nairobi, Kenya',
    latitude: -1.2197531,
    longitude: 36.88588850000001,
  },
});


export const createTripDetails = () => ({
  reason: {
    user: { id: 'UG9LLMA5R', name: 'edafeadjeke.emunotor' },
    reason: 'mnl'
  },
  passengers: '1',
  department: { name: 'launchpad', type: 'button', value: '19' },
  pickupLocation: {
    time: '22/12/2019 22:00',
    submission:
    {
      dateTime: '22/12/2019 22:00',
      pickup: 'Nairobi',
      othersPickup: null,
    }
  },
  pickUpAddress: {
    address: 'Andela Kenya, TRM Dr, Nairobi, Kenya',
    latitude: -1.2197531,
    longitude: 36.88588850000001,
  },
  destinationAddress: {
    address: 'Andela Kenya, TRM Dr, Nairobi, Kenya',
    latitude: -1.2197531,
    longitude: 36.88588850000001,
  }

});

export const tripRequestDetails = () => ({
  riderId: 4,
  pickup: 'dummy',
  destination: 'dummy',
  othersPickup: 'dummy',
  othersDestination: 'dummy',
  name: 'name',
  reason: 'This is a reason',
  forSelf: 'false',
  departmentId: 1,
  tripStatus: 'Pending',
  dateTime: '2019-07-26T08:55:00.000Z',
  requestedById: 4,
  originId: 1,
  destinationId: 1,
  tripType: 'Regular Trip',
  providerId: 1
});

export const createPayloadWithEmbassyTime = (value = 'value', name = 'name') => ({
  actions: [{ value, name, selected_options: [{ value, name }] }],
  user: { id: 'dummyId' },
  team: { id: 'XXXXXXX' },
  callback_id: `schedule_trip_${value}`,
  submission: {
    pickup: 'pickup',
    others_pickup: 'others_pickup',
    destination: 'destination',
    others_destination: 'others_destination',
    date_time: '10/10/2018 22:00',
    embassyVisitDateTime: '10/10/2018 22:00',
    reason: 'test reason',
  }
});


export const respondMock = () => (jest.fn((value) => value));

export const OpsTripActionDataMock = {
  actions: [{ name: 'confirmTrip', type: 'button', value: '25' }],
  team: { id: 'TJPMCN24X', domain: 'adaezeodurukwe' },
  user: { id: 'UJPMCN431', name: 'adaeze.eze-odurukwe' },
  channel: { id: 'CJMAUUJSY', name: 'travelling-app' },
  original_message: {
    ts: '1558172628.000100',
  }
};

export const createTripActionWithOptionsMock = (value, name) => ({
  ...OpsTripActionDataMock,
  actions: [{ selected_options: [{ value, name }] }],
});
