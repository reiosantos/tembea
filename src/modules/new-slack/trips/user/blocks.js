const prefix = 'user_trip_';

const userTripBlocks = Object.freeze({
  start: `${prefix}book_trip_start`,
  selectDepartment: `${prefix}select_department`,
  selectRider: `${prefix}select_rider`,
  selectNumberOfPassengers: `${prefix}select_no_of_passengers`,
  navBlock: `${prefix}nav_block`,
  addPassengers: `${prefix}add_passengers`,
  setRider: `${prefix}set_rider`,
  confirmLocation: `${prefix}confirm_location`,
  getDestFields: `${prefix}set_destination`,
  confirmTrip: `${prefix}confirm_trip_request`
});

export default userTripBlocks;
