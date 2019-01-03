import DepartmentValidator from '../DepartmentValidator';
import HttpError from '../../helpers/errorHandler';

describe('Department Validator', () => {
  it('should throw an error when wrong data is sent to validateDeletePropsValues', (done) => {
    HttpError.sendErrorResponse = jest.fn(() => {});
    DepartmentValidator.validateDeletePropsValues('no', 'no', () => {});
    expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    done();
  });

  it('should throw an error when wrong data is sent to validateDeleteProps', (done) => {
    HttpError.sendErrorResponse = jest.fn(() => {});
    DepartmentValidator.validateDeleteProps('no', 'no', () => {});
    expect(HttpError.sendErrorResponse).toHaveBeenCalledTimes(1);
    done();
  });
});
