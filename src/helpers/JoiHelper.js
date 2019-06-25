import * as Joi from '@hapi/joi';

export default class JoiHelper {
  static validateSubmission(submission, schema) {
    const { error, value } = Joi.validate(submission, schema, {
      abortEarly: false,
      convert: true,
    });
    if (error) {
      return JoiHelper.handleError(error.details);
    }
    return value;
  }

  static handleError(errorDetails) {
    const errorObject = { errorMessage: 'Validation error occurred, see error object for details' };
    errorDetails.forEach(({
      message, type, context, context: { label }
    }) => {
      switch (type) {
        case 'any.required': errorObject[`${label}`] = `Please provide ${label}`;
          break;
        case 'any.allowOnly': errorObject[`${label}`] = `only ${context.valids} are allowed`;
          break;
        case 'number.base': errorObject[`${label}`] = `${label} should be a number`;
          break;
        case 'number.min': errorObject[`${label}`] = `${label} should not be less than ${context.limit}`;
          break;
        case 'number.max': errorObject[`${label}`] = `${label} should not be greater than ${context.limit}`;
          break;
        case 'string.email': errorObject[`${label}`] = 'please provide a valid email address';
          break;
        case 'string.regex.base': errorObject[`${label}`] = `please provide a valid ${label}`;
          break;
        default: errorObject[`${label}`] = `${message}`;
      }
    });
    return errorObject;
  }
}
