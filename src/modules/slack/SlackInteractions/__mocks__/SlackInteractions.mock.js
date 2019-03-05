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
  callback_id: `schedule_trip_${value}`,
  submission: {
    pickup: 'pickup',
    others_pickup: 'others_pickup',
    destination: 'destination',
    others_destination: 'others_destination',
    date_time: '10/10/2018 22:00',
    flightDateTime: '10/10/2018 22:00',
    reason: 'test reason',
    pageNumber: 3,
    search: 'search parameter'
  }
});

export const tripRequestDetails = () => ({
  riderId: 4,
  name: 'name',
  reason: 'This is a reason',
  forSelf: 'false',
  departmentId: 1,
  tripStatus: 'Pending',
  departureTime: '10/10/2018 22:00',
  requestedById: 4,
  originId: 1,
  destinationId: 1,
  tripType: 'Regular Trip'
});

export const respondMock = () => (jest.fn(value => value));
