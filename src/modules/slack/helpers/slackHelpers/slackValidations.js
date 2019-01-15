const isTripRequestApproved = (request) => {
  const { approvedById } = request;
  return !!approvedById;
};

const isTripRescheduleTimedOut = (tripRequest) => {
  const { departureTime } = tripRequest;
  let timeOut = (Date.parse(departureTime) - Date.now()) / 60000;
  // timeOut in Hours
  timeOut /= 60;
  return timeOut < 1;
};

const isSlackSubCommand = (commandToCheck, subCommand) => commandToCheck.includes(subCommand);

export { isSlackSubCommand, isTripRescheduleTimedOut, isTripRequestApproved };
