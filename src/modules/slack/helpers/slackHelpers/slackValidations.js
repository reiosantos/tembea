export function IsTripRequestConfirmed(request) {
  const { confirmedById } = request;
  if (confirmedById) {
    return true;
  }
  return false;
}
    
export function IsTripRescheduleTimedOut(tripRequest) {
  const { departureTime } = tripRequest;
  let timeOut = (Date.parse(departureTime) - Date.now()) / 60000;
  // timeOut in Hours
  timeOut /= 60;
  return timeOut < 1;
}
