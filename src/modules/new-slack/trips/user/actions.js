const prefix = 'user_trip_';
const userTripActions = Object.freeze({
  forMe: `${prefix}for_me`,
  forSomeone: `${prefix}for_someone`,
  setReason: `${prefix}set_reason`,
  getDepartment: `${prefix}get_department`,
  back: `${prefix}back`,
  reasonDialog: `${prefix}get_reason`,
  addExtraPassengers: `${prefix}add_extra_passengers`,
  noPassengers: `${prefix}no_passengers`,
  setPassenger: `${prefix}set_passenger`,
  pickupDialog: `${prefix}get_pickup`,
  destDialog: `${prefix}get_destination`,
  sendDest: `${prefix}select_destination`,
  selectLocation: `${prefix}select_location`,
  selectPickupLocation: `${prefix}select_pickup_location`,
  selectDestinationLocation: `${prefix}select_destination_location`,
  confirmTripRequest: `${prefix}confirm_trip_request`,
  cancelTripRequest: `${prefix}cancel_trip_request`,
  cancel: `${prefix}cancel`,
  payment: `${prefix}payment`
});

export default userTripActions;
