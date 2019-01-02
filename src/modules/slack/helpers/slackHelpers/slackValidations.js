const isTripRequestApproved = (request) => {
  const { approvedById } = request;
  if (approvedById) {
    return true;
  }
  return false;
};

const isTripRescheduleTimedOut = (tripRequest) => {
  const { departureTime } = tripRequest;
  let timeOut = (Date.parse(departureTime) - Date.now()) / 60000;
  // timeOut in Hours
  timeOut /= 60;
  return timeOut < 1;
};

const isSlackSubCommand = (commandTocheck, subCommand) => commandTocheck.includes(subCommand);

export { isSlackSubCommand, isTripRescheduleTimedOut, isTripRequestApproved };
