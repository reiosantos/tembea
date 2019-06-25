import AddressValidator from '../AddressValidator';
import HttpError from '../../helpers/errorHandler';

let res;
let next;
describe('AddressValidator_validateAddressBody', () => {
  beforeEach(() => {
    res = {
      status: jest.fn(() => ({
        json: jest.fn()
      }))
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return error for invalid longitude and latitude', (done) => {
    jest.spyOn(HttpError, 'sendErrorResponse');
    AddressValidator.validateAddressBody({ body: {} }, res, next);
    expect(HttpError.sendErrorResponse).toHaveBeenCalled();
    done();
  });
});
