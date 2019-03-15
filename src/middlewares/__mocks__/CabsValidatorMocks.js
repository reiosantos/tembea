const correctReq = {
  body: {
    driverName: 'Ozokwor Abenaje',
    driverPhoneNo: '09488928334',
    regNumber: 'KCA 5432',
    capacity: '3',
    model: 'Aventador',
    location: 'Kigali'
  }
};

const incompleteReq = {
  body: {
    driverName: 'Ozokwor Abenaje',
    driverPhoneNo: '09488928334',
    capacity: '3',
    location: 'Cairo'
  }
};

const invalidPhoneNoReq = {
  body: {
    driverName: 'Ozokwor Abenaje',
    driverPhoneNo: '----5',
    regNumber: 'KCA 5432',
    capacity: '3',
    model: 'Aventador',
    location: 'San Francisco'
  }
};

const invalidCapacityReq = {
  body: {
    driverName: 'Ozokwor Abenaje',
    driverPhoneNo: '09488928334',
    regNumber: 'KCA 5432',
    capacity: '0',
    model: 'Aventador',
    location: 'Nairobi'
  }
};

const invalidLocationReq = {
  body: {
    driverName: 'Ozokwor Abenaje',
    driverPhoneNo: '09488928334',
    regNumber: 'KCA 5432',
    capacity: '4',
    model: 'Aventador',
    location: '73'
  }
};

const emptySpacesReq = {
  body: {
    driverName: '  ',
    driverPhoneNo: '09488928334',
    regNumber: 'KCA 5432',
    capacity: '3',
    model: 'Aventador',
    location: 'Accra'
  }
};

const errorMessages = {
  message: {
    inputErrors: [
      'Please provide regNumber.',
      'Please provide model.'
    ]
  }
};

const invalidPhoneNoErr = {
  message: { invalidInput: 'Use a valid phone number' }
};

const invalidCapacityErr = {
  message: { invalidInput: 'Capacity should be a number and greater than zero' }
};

const invalidLocationErr = {
  message: { invalidInput: 'Location cannot include numbers' }
};

const emptyInputErr = {
  message: {
    checkEmptyInputData: [
      'Please provide a value for driverName.'
    ]
  }
};

export {
  correctReq, incompleteReq, invalidPhoneNoReq, invalidCapacityReq,
  emptySpacesReq, invalidLocationReq, errorMessages, invalidPhoneNoErr,
  invalidCapacityErr, invalidLocationErr, emptyInputErr,
};
