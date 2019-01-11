export default (value = 'value', name = 'name') => ({
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
    reason: 'test reason'
  }
});
