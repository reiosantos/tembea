const TripConfirmFailMock = { success: false, message: 'failed' };
const TotalFail = {
  message: 'Dang, something went wrong there.',
  success: false
};
const TripConfirmSuccessMock = {
  success: true,
  message: 'trip confirmed'
};
const TripDeclineSuccessMock = {
  success: true,
  message: 'trip declined'
};

export {
  TripConfirmFailMock, TotalFail, TripConfirmSuccessMock, TripDeclineSuccessMock
};
