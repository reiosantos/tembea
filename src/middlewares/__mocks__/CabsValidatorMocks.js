const correctReq = {
  body: {
    regNumber: 'KCA 5432',
    capacity: '3',
    model: 'Aventador',
  }
};

const incompleteReq = {
  body: {
    capacity: '3',
  }
};


const invalidCapacityReq = {
  body: {
    regNumber: 'KCA 5432',
    capacity: '0',
    model: 'Aventador',
  }
};


const emptySpacesReq = {
  body: {
    regNumber: 'KCA 5432',
    capacity: '3',
    model: '   ',
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


const invalidCapacityError = {
  message: { invalidInput: 'Capacity should be a number and greater than zero' }
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
      'Please provide regNumber.',
      'Please provide capacity.',
      'Please provide model.',
    ]
  }
};

const noValueErrors = {
  success: false,
  message: {
    checkEmptyInputData: [
      'Please provide a value for the model.'
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

const validUpdateBody = {
  params: { id: '33' },
  body: {
    regNumber: 'KCA 5432',
  }
};

const invalidInput = {
  message: 'Please provide a positive integer value',
  statusCode: 400
};

const emptyValueInBody = {
  params: { id: '33' },
  body: {
    model: ''
  }
};

export default {
  correctReq,
  incompleteReq,
  invalidCapacityReq,
  emptySpacesReq,
  errorMessages,
  invalidCapacityError,
  invalidReqParams,
  emptyUpdateBody,
  invalidParamsError,
  noInputsError,
  noValueErrors,
  validUpdateBody,
  invalidInput,
  emptyValueInBody
};
