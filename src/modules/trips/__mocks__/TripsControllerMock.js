const TripConfirmFailMock = { success: false, message: 'some fields are missing in the body' };
const TotalFail = {
  message: 'Dang, something went wrong there.',
  success: false
};
const TripConfirmSuccessMock = {
  success: true,
  message: 'trip confirmed'
};

export { TripConfirmFailMock, TotalFail, TripConfirmSuccessMock };
