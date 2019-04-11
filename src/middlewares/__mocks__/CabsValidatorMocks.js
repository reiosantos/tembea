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
  params: {
    id: 22
  },
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
  params: {
    id: 22
  },
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

const invalidPhoneNoError = {
  message: { invalidInput: 'Use a valid phone number' }
};

const invalidCapacityError = {
  message: { invalidInput: 'Capacity should be a number and greater than zero' }
};

const invalidLocationError = {
  message: { invalidInput: 'Location cannot include numbers' }
};

const emptyInputError = {
  message: {
    checkEmptyInputData: [
      'Please provide a value for driverName.'
    ]
  }
};
const invalidParamsError = {
  message: {
    invalidParameter:
    'Id should be a valid interger'
  }
};
const noInputsError = {
  success: false,
  message: {
    inputErrors: [
      'Please provide driverName.',
      'Please provide driverPhoneNo.',
      'Please provide regNumber.',
      'Please provide capacity.',
      'Please provide model.',
      'Please provide location.'
    ]
  }
};

const noValueErrors = {
  success: false,
  message: {
    checkEmptyInputData: [
      'Please provide a value for driverName.'
    ]
  }
};

const invalidReqParams = {
  params: {
    id: 'notInteger'
  }
};
const emptyUpdateBody = {
  params: { id: '33' },
  body: { }
};

const emptyValueInBody = {
  params: { id: '33' },
  body: {
    driverName: '',
    location: 'location'
  }
};

const updateBodyInvalidLocation = {
  params: { id: '33' },
  body: {
    driverName: 'Muhwezi Deo',
    location: '80'
  }
};

const validUpdateBody = {
  params: { id: '33' },
  body: {
    driverName: 'Muhwezi Deo'
  }
};

const invalidInput = {
  message: 'Please provide a positive integer value',
  statusCode: 400
};


export default {
  correctReq,
  incompleteReq,
  invalidPhoneNoReq,
  invalidCapacityReq,
  emptySpacesReq,
  invalidLocationReq,
  errorMessages,
  invalidPhoneNoError,
  invalidCapacityError,
  invalidLocationError,
  emptyInputError,
  invalidReqParams,
  emptyUpdateBody,
  invalidParamsError,
  noInputsError,
  emptyValueInBody,
  noValueErrors,
  updateBodyInvalidLocation,
  validUpdateBody,
  invalidInput
};
