import jwt from 'jsonwebtoken';
import Utils from '../index';

describe('Utils Method', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should test the verify token method', async () => {
    const mockObject = { verify: 'verified' };
    const jwtMock = jest.spyOn(jwt, 'verify');
    jwtMock.mockImplementation(() => (mockObject));
    const result = await Utils.verifyToken('token', 'secret');

    expect(result).toEqual(mockObject);
    expect(jwtMock).toHaveBeenCalled();
  });

  it('should test the verify token and throw an error', async () => {
    const mockErr = new Error('boo');
    const jwtMock = jest.spyOn(jwt, 'verify');
    jwtMock.mockRejectedValue(mockErr);

    expect.assertions(2);
    try {
      await Utils.verifyToken('token', 'secret');
    } catch (e) {
      expect(e).toEqual(mockErr);
    }

    expect(jwtMock).toHaveBeenCalled();
  });

  it('should test generate token method successfully', () => {
    const tokenMock = 'tokenTokenToken';
    const jwtMock = jest.spyOn(jwt, 'sign');
    jwtMock.mockImplementation(() => tokenMock);

    const result = Utils.generateToken(122, 'payload');
    expect(result).toEqual(tokenMock);
    expect(jwtMock).toHaveBeenCalled();
  });

  it('should test mapThroughArrayOfObjects method and return mapped array', () => {
    const arrayMock = [{ id: 1 }];
    const result = Utils.mapThroughArrayOfObjectsByKey(arrayMock, 'id');
    expect(result).toEqual([1]);
  });

  it('should test the mapThroughArrayOfObjects method and return an empty array', () => {
    const arrayMock = [];
    const result = Utils.mapThroughArrayOfObjectsByKey(arrayMock, 'id');
    expect(result).toEqual([]);
  });

  it('should test the formatUserInfo method and return userInfo formatted', () => {
    const userMock = {
      dataValues: {
        id: 1, name: 'Zlatan', slackId: 'EAZI123', phoneNo: 802323, email: 'zlatan@eazi.com'
      }
    };
    jest.spyOn(Utils, 'mapThroughArrayOfObjectsByKey')
      .mockImplementation(() => ['role']);

    const result = Utils.formatUserInfo(userMock, 'roles');
    expect(result).toHaveProperty('id', 1);
    expect(result).toHaveProperty('roles', ['role']);
  });

  describe('convertToImageAndSaveToLocal', () => {
    const urls = 'http://maps.googleapis.com/maps/api/staticmap?size=700x700';
    const destination = './files';
    it('should convert googleMap url into jpeg and save it to local', async (done) => {
      const result = await Utils.convertToImageAndSaveToLocal(urls, destination);

      expect(result).toBeDefined();
      done();
    });
  });
});
