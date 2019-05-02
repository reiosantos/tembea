import request from 'supertest';
import faker from 'faker';
import app from '../../../app';
import Utils from '../../../utils';
import RoutesController from '../RouteController';
import RoutesUsageController from '../RouteUsageController';
import AddressService from '../../../services/AddressService';
import LocationService from '../../../services/LocationService';
import { RoutesHelper } from '../../../helpers/googleMaps/googleMapsHelpers';
import { GoogleMapsPlaceDetails, SlackInteractiveMessage } from '../../slack/RouteManagement/rootFile';
import HttpError from '../../../helpers/errorHandler';
import RouteService from '../../../services/RouteService';
import RouteRequestService from '../../../services/RouteRequestService';
import { mockRouteRequestData, mockRouteBatchData } from '../../../services/__mocks__';
import Response from '../../../helpers/responseHelper';
import { SlackEvents } from '../../slack/events/slackEvents';
import UserService from '../../../services/UserService';
import TeamDetailsService from '../../../services/TeamDetailsService';
import RouteNotifications from '../../slack/SlackPrompts/notifications/RouteNotifications';
import BugsnagHelper from '../../../helpers/bugsnagHelper';
import BatchUseRecordService from '../../../services/BatchUseRecordService';
import RouteHelper from '../../../helpers/RouteHelper';
import {
  batchRecords, successMessage, returnedObject, percentages
} from '../__mocks__/routeMock';

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

  describe('deleteRouteBatch()', () => {
    let req;
    let res;
    beforeEach(() => {
      req = {
        params: {
          routeBatchId: 2
        },
        body: {
          teamUrl: 'url.slack.com'
        }
      };
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => { })
        })).mockReturnValue({ json: jest.fn() })
      };
    });
    it('should delete a routeBatch', async (done) => {
      RouteService.getRouteBatchByPk = jest.fn(() => mockRouteBatchData);
      RouteService.deleteRouteBatch = jest.fn(() => 1);
      SlackEvents.raise = jest.fn(() => { });

      await RoutesController.deleteRouteBatch(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'route batch deleted successfully', success: true
      });
      done();
    });
    it('should return a not found error', async (done) => {
      const spy = jest.spyOn(HttpError, 'throwErrorIfNull');
      RouteService.getRouteBatchByPk = jest.fn(() => false);
      RouteService.deleteRouteBatch = jest.fn(() => 0);

      await RoutesController.deleteRouteBatch(req, res);
      expect(HttpError.throwErrorIfNull).toHaveBeenCalledTimes(1);
      expect(HttpError.throwErrorIfNull).toHaveBeenCalledWith(
        false, 'route batch not found'
      );
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      spy.mockRestore();
      done();
    });
  });
  describe('getAll()', () => {
    let req;
    let res;
    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => { })
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
  describe('getOne', () => {
    let req;
    let res;
    beforeEach(() => {
      req = {
        params: {
          id: 2
        }
      };
      res = {
        status: jest.fn(() => ({})).mockReturnValue({ json: jest.fn() })
      };
    });
    it('should give error message if route doesnt exist', (done) => {
      request(app)
        .get('/api/v1/routes/178882')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .expect(404, (err, response) => {
          const { body } = response;
          expect(body).toHaveProperty('message');
          expect(body).toEqual({ message: 'Route not found', success: false });
          done();
        });
    });
    it('should successfully fetch one routes', async (done) => {
      jest.spyOn(RouteService, 'getRoute').mockResolvedValue(mockRouteBatchData);
      await RoutesController.getOne(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.status().json).toHaveBeenCalledTimes(1);
      expect(res.status().json).toHaveBeenCalledWith({
        message: 'Success',
        route: mockRouteBatchData
      });
      done();
    });
    it('should give error message if route is not integer', (done) => {
      request(app)
        .get('/api/v1/routes/102ed')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .expect(200, (err, response) => {
          const { body } = response;
          expect(body).toHaveProperty('message');
          expect(body).toEqual({
            message: 'Please provide a positive integer value',
            success: false
          });
          done();
        });
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
      vehicle: 'APP 519 DT',
      routeName: 'Yaba',
      destination: {
        address: 'Some address in Yaba',
        coordinates: {
          lat: faker.address.latitude(),
          lng: faker.address.longitude()
        }
      },
      takeOffTime: '12:12',
      capacity: 4,
    };
    it('should fail if props are missing', (done) => {
      const message = 'The following fields are missing: vehicle';
      const newData = { ...data };
      delete newData.vehicle;
      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(newData)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toEqual({ message, success: false });
          done();
        });
    });

    it('should fail if prop values are invalid', (done) => {
      const message = 'Your request contain errors';
      const errorMessage = ['Enter a value for vehicle'];
      const newData = { ...data, vehicle: '' };

      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(newData)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toHaveProperty('data');
          expect(body).toEqual({ message, success: false, data: errorMessage });
          done();
        });
    });

    it('should successfully create a route', (done) => {
      jest.spyOn(AddressService, 'createNewAddress')
        .mockResolvedValue({ address: 'Epic Tower' });
      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data)
        .expect(200, (err, res) => {
          const { body: { data: route } } = res;
          assertRouteInfo(route);
          expect(route.name).toEqual('Yaba');
          expect(route.status).toEqual('Inactive');
          expect(route.takeOff).toEqual('12:12');
          expect(route.capacity).toEqual(4);
          expect(route.regNumber).toEqual('APP 519 DT');
          done();
        });
    });

    it('should successfully create a route', (done) => {
      jest.spyOn(AddressService, 'findAddress')
        .mockResolvedValue({ address: 'Epic Tower' });

      const message = 'Address already exists';

      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data)
        .expect(200, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toEqual({ message, success: false });
          done();
        });
    });

    it('should successfully create a route', (done) => {
      jest.spyOn(AddressService, 'findAddress')
        .mockResolvedValue(null);
      jest.spyOn(LocationService, 'findLocation')
        .mockResolvedValue({ longitude: 'someValue', latitude: 'someValue' });

      const message = 'Provided coordinates belong to an existing address';

      request(app)
        .post('/api/v1/routes')
        .set('Content-Type', 'application/json')
        .set('Authorization', validToken)
        .send(data)
        .expect(500, (err, res) => {
          const { body } = res;
          expect(body).toHaveProperty('message');
          expect(body).toHaveProperty('success');
          expect(body).toEqual({ message, success: false });
          done();
        });
    });

    it('should handle internal server error', (done) => {
      jest.spyOn(AddressService, 'createNewAddress')
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

  describe('RouteController_getRouteUsage', () => {
    let req;
    let res;
    let usageServiceSpy;
    beforeEach(() => {
      req = {
        query: {
          from: '2019-05-05', to: '2019-05-06'
        }
      };
      res = {
        status: jest.fn(() => ({
          json: jest.fn(() => { })
        })).mockReturnValue({ json: jest.fn() })
      };
      usageServiceSpy = jest.spyOn(BatchUseRecordService, 'getRoutesUsage');
    });
    it('Should return the most and least used routes', async () => {
      const percentageSpy = jest.spyOn(RouteHelper, 'findPercentageUsage');
      usageServiceSpy.mockResolvedValue(batchRecords);
      percentageSpy.mockReturnValue(percentages);
      jest.spyOn(Response, 'sendResponse');
      await RoutesUsageController.getRouteUsage(req, res);
      expect(RouteHelper.findPercentageUsage).toHaveBeenCalled();
      expect(Response.sendResponse).toHaveBeenCalled();
      expect(Response.sendResponse).toBeCalledWith(res, 200, true, successMessage, returnedObject);
    });

    it('Should catch errors', async () => {
      const error = new Error('Something went wrong');
      usageServiceSpy.mockRejectedValue(error);
      jest.spyOn(BugsnagHelper, 'log');
      jest.spyOn(HttpError, 'sendErrorResponse');

      await RoutesUsageController.getRouteUsage(req, res);
      expect(BugsnagHelper.log).toBeCalled();
      expect(BugsnagHelper.log).toBeCalledWith(error);
      expect(HttpError.sendErrorResponse).toBeCalled();
      expect(HttpError.sendErrorResponse).toBeCalledWith(error, res);
    });
  });
});

describe('RouteController unit test', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  const reqMock = {
    body: { status: 'Inactive', teamUrl: 'team@slack.com' },
    params: { routeId: 1 }
  };

  describe('Update RouteBatch Details', () => {
    it('should call the response method with success message for route status update', async () => {
      jest.spyOn(Response, 'sendResponse').mockImplementation();
      jest.spyOn(RouteService, 'updateRouteBatch').mockResolvedValue('good');
      const eventsMock = jest.spyOn(SlackEvents, 'raise').mockImplementation();
      const message = 'Route batch successfully updated';

      await RoutesController.updateRouteBatch(reqMock, 'res');
      expect(eventsMock).toHaveBeenCalledTimes(1);
      expect(eventsMock).toHaveBeenCalledWith('notify_route_riders', 'team@slack.com', 'good');
      expect(Response.sendResponse).toHaveBeenCalledTimes(1);
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 200, true, message, 'good');
    });

    it('should call response method with success message for general route update', async () => {
      jest.spyOn(Response, 'sendResponse').mockImplementation();
      jest.spyOn(RouteService, 'updateRouteBatch').mockResolvedValue('good');
      const eventsMock = jest.spyOn(SlackEvents, 'raise').mockImplementation();
      const message = 'Route batch successfully updated';

      await RoutesController.updateRouteBatch(
        { ...reqMock, body: { ...reqMock.body, status: 'Active' } },
        'res'
      );
      expect(eventsMock).toHaveBeenCalledWith('notify_route_riders', 'team@slack.com', 'good');
      expect(Response.sendResponse).toHaveBeenCalledWith('res', 200, true, message, 'good');
    });

    it('should call HTTPError response method when an error is caught', async () => {
      const err = new Error('Try Again');
      jest.spyOn(RouteService, 'updateRouteBatch').mockRejectedValue(err);
      const responseMock = jest.spyOn(Response, 'sendResponse').mockImplementation();
      const httpErrorResponseMock = jest.spyOn(HttpError, 'sendErrorResponse').mockImplementation();
      const eventsMock = jest.spyOn(SlackEvents, 'raise').mockImplementation();

      await RoutesController.updateRouteBatch(reqMock, 'res');

      expect(eventsMock).not.toHaveBeenCalled();
      expect(responseMock).not.toHaveBeenCalled();
      expect(httpErrorResponseMock).toHaveBeenCalledTimes(1);
      expect(httpErrorResponseMock).toHaveBeenCalledWith(err, 'res');
    });
  });

  describe('deleteFellowFromRoute', () => {
    let userSpy;
    let notificationSpy;
    let res;
    const req = {
      params: { userId: 2 },
      body: { teamUrl: 'andela-tembea.slack.com' }
    };

    beforeEach(() => {
      userSpy = jest.spyOn(UserService, 'getUserById');
      notificationSpy = jest.spyOn(RouteNotifications, 'sendNotificationToRider')
        .mockImplementation(jest.fn());
      res = {
        status: jest.fn().mockReturnValue({ json: jest.fn() })
      };
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should remove a fellow successfully from a route and send a notification', async () => {
      jest.spyOn(UserService, 'updateUser').mockImplementation(jest.fn());
      jest.spyOn(TeamDetailsService, 'getTeamDetailsByTeamUrl').mockResolvedValue({
        botToken: 'token'
      });
      jest.spyOn(RouteService, 'getRoute').mockResolvedValue({
        dataValues: { route: { dataValues: { name: 'home' } } }
      });
      userSpy.mockResolvedValue({
        dataValues: { routeBatchId: 1, slackId: 'user' }
      });
      const message = new SlackInteractiveMessage(
        '*Hey <@user>, You\'ve been removed from `home` route.* \n *:information_source: Reach out to Ops department for any questions*.'
      );

      await RoutesController.deleteFellowFromRoute(req, res);

      expect(res.status).toBeCalledWith(200);
      expect(res.status().json).toBeCalledWith({
        success: true,
        message: 'fellow successfully removed from the route',
        undefined
      });
      expect(notificationSpy).toBeCalledWith(message, 'user', 'token');
    });

    it('should return a message if the user is not on a route', async () => {
      userSpy.mockResolvedValue({
        dataValues: { routeBatchId: null, slackId: 'user' }
      });
      await RoutesController.deleteFellowFromRoute(req, res);

      expect(res.status).toBeCalledWith(200);
      expect(res.status().json).toBeCalledWith({
        success: true,
        message: 'user doesn\'t belong to this route',
        undefined
      });
      expect(notificationSpy).not.toBeCalled();
    });

    it('should throw an error if delete fails', async () => {
      const error = new Error('Dummy Error');
      userSpy.mockResolvedValue({
        dataValues: { routeBatchId: 2, slackId: 'user' }
      });
      jest.spyOn(UserService, 'updateUser').mockRejectedValue(error);
      const bugsnagSpy = jest.spyOn(BugsnagHelper, 'log')
        .mockImplementation(jest.fn());
      const httpErrorSpy = jest.spyOn(HttpError, 'sendErrorResponse')
        .mockImplementation(jest.fn());

      await RoutesController.deleteFellowFromRoute(req, res);

      expect(bugsnagSpy).toBeCalledWith(error);
      expect(httpErrorSpy).toBeCalledWith(error, res);
    });
  });
});
