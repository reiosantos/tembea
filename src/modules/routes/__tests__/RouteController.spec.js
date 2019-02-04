import request from 'supertest';
import faker from 'faker';
import app from '../../../app';
import Utils from '../../../utils';
import RoutesController from '../RouteController';
import AddressService from '../../../services/AddressService';
import { RoutesHelper } from '../../../helpers/googleMaps/googleMapsHelpers';
import { GoogleMapsPlaceDetails } from '../../slack/RouteManagement/rootFile';
import HttpError from '../../../helpers/errorHandler';
import RouteService from '../../../services/RouteService';
import RouteRequestService from '../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../services/__mocks__';

const assertRouteInfo = (body) => {
  expect(body)
    .toHaveProperty('id');
  expect(body)
    .toHaveProperty('status');
  expect(body)
    .toHaveProperty('takeOff');
  expect(body)
    .toHaveProperty('capacity');
  expect(body)
    .toHaveProperty('batch');
  expect(body)
    .toHaveProperty('inUse');
  expect(body)
    .toHaveProperty('name');
  expect(body)
    .toHaveProperty('destination');
  expect(body)
    .toHaveProperty('driverName');
  expect(body)
    .toHaveProperty('driverPhoneNo');
  expect(body)
    .toHaveProperty('regNumber');
  expect(body)
    .toHaveProperty('id');
};

describe('RoutesController', () => {
  let validToken;
  beforeAll(() => {
    validToken = Utils.generateToken('30m', { userInfo: { roles: ['Super Admin'] } });
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('getAll()', () => {
    let req;
    let res;
    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => {})
        })).mockReturnValue({ json: jest.fn() })
      };
    });
    it('should return all route requests', async (done) => {
      RouteRequestService.getAllConfirmedRouteRequests = jest.fn(() => mockRouteRequestData);

      await RoutesController.getAll(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledWith({ routes: mockRouteRequestData });
      done();
    });

    it('should throw an Error', async (done) => {
      RouteRequestService.getAllConfirmedRouteRequests = jest.fn(() => {
        throw Error('This is an error');
      });

      await RoutesController.getAll(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'An error has occurred', success: false
      });
      done();
    });
  });
  describe('getRoutes', () => {
    it('should successfully fetch routes', (done) => {
      request(app)
        .get('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('data');
          expect(body.data).toHaveProperty('pageMeta');
          expect(body.data).toHaveProperty('routes');
          if (body.data.routes.length) {
            assertRouteInfo(body.data.routes[0]);
          }
          done();
        });
    });
    it('should handle internal server error', (done) => {
      jest.spyOn(RouteService, 'getRoutes')
        .mockRejectedValue(new Error('dummy error'));
      request(app)
        .get('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .expect(500, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toEqual({ message: 'dummy error', success: false });
          done();
        });
    });
  });
  describe('createRoute', () => {
    const data = {
      vehicleRegNumber: 'APP 519 DT',
      routeName: 'Yaba',
      destinationCoordinates: `${faker.address.latitude()},${faker.address.longitude()}`,
      takeOffTime: '12:12',
      capacity: 4
    };
    it('should successfully fetch routes', (done) => {
      jest.spyOn(RoutesController, 'saveDestination')
        .mockResolvedValue({ address: 'Epic Tower' });
      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data)
        .expect(200, (err, res) => {
          const { body } = res;
          assertRouteInfo(body);
          expect(body.name).toEqual('Yaba');
          expect(body.status).toEqual('Inactive');
          expect(body.takeOff).toEqual('12:12');
          expect(body.capacity).toEqual(4);
          expect(body.regNumber).toEqual('APP 519 DT');
          done();
        });
    });
    it('should handle internal server error', (done) => {
      jest.spyOn(RoutesController, 'saveDestination')
        .mockRejectedValue(new Error('dummy error'));
      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data)
        .expect(500, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toEqual({ message: 'dummy error', success: false });
          done();
        });
    });
  });
  describe('saveDestination', () => {
    const latitude = faker.address.latitude();
    const longitude = faker.address.longitude();
    const coordinates = `${latitude},${longitude}`;
    afterEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should fetch address from database if coordinates has been saved', async () => {
      jest.spyOn(AddressService, 'findAddressByCoordinates')
        .mockResolvedValue({ address: 'dummy address' });
      const result = await RoutesController.saveDestination(coordinates);
      expect(AddressService.findAddressByCoordinates).toHaveBeenCalledWith(longitude, latitude);
      expect(result).toEqual({ address: 'dummy address' });
    });
    it('should fetch and save address from google maps api', async () => {
      const place = {
        place_id: '',
        geometry: { location: { lat: latitude, lng: longitude } }
      };
      const details = { result: { name: '', formatted_address: '' } };
      const address = `${details.result.name}, ${details.result.formatted_address}`;

      jest.spyOn(RoutesHelper, 'getPlaceInfo')
        .mockResolvedValue(place);
      jest.spyOn(GoogleMapsPlaceDetails, 'getPlaceDetails')
        .mockResolvedValue(details);
      jest.spyOn(AddressService, 'createNewAddress')
        .mockResolvedValue('saved');

      const result = await RoutesController.saveDestination(coordinates);

      expect(RoutesHelper.getPlaceInfo).toHaveBeenCalledWith('coordinates', coordinates);
      expect(GoogleMapsPlaceDetails.getPlaceDetails)
        .toHaveBeenCalledWith(place.place_id);
      expect(AddressService.createNewAddress)
        .toHaveBeenCalledWith(longitude, latitude, address);

      expect(result).toEqual('saved');
    });
    it('should throw if google maps api could not find address', async () => {
      const place = null;
      jest.spyOn(RoutesHelper, 'getPlaceInfo')
        .mockResolvedValue(place);
      try {
        await RoutesController.saveDestination(coordinates);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.statusCode).toEqual(400);
        expect(error.message).toEqual('Invalid Coordinates');
      }
    });
  });
});
