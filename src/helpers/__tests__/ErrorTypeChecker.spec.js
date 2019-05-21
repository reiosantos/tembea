import ErrorTypeChecker from '../ErrorTypeChecker';
import models from '../../database/models';

const { sequelize } = models;

describe('ErrorTypeChecker', () => {
  it('should return custom message and status code incase of sequelize error', () => {
    const error = new sequelize.ValidationError();
    const result = ErrorTypeChecker.checkSequelizeValidationError(error, 'Name already Taken');
    expect(result.message).toEqual('Name already Taken');
    expect(result.statusCode).toEqual(400);
  });

  it('should return error is not instance of sequelize Validation error', () => {
    const error = new Error('Something Went wrong');
    const result = ErrorTypeChecker.checkSequelizeValidationError(error, 'Name already Taken');
    expect(error).toEqual(result);
  });
});
