import RouteService, { routeService } from '../RouteService';
import models from '../../database/models/index';
import Cache from '../../cache';
import HttpError from '../../helpers/errorHandler';
import UserService from '../UserService';
import { mockRouteBatchData as routeBatch } from '../__mocks__';
import RouteServiceHelper from '../../helpers/RouteServiceHelper';

const {
  Route, RouteBatch, Cab, Address, sequelize, Sequelize, User,
} = models;

describe('RouteService', () => {
  const {
    route, ...batchDetails
  } = routeBatch;
  const firstRoute = {
    route: {
      id: 12,
      name: 'c',
      destinationid: 1,
      routeBatch: [{ batch: 'C' }],
      riders: [{}, {}, {}, {}],
      capacity: 4
    }
  };

  const routeCreationResult = {
    cabDetails: {
      id: 1, capacity: 4, regNumber: 'CCCCCC', model: 'saburu'
    },
    route: {
      name: 'ZZZZZZ',
      imageUrl: 'https://image-url',
      destination: { id: 456, address: 'BBBBBB' },
      routeBatch: [{ batch: 'A' }]
    },
    riders: [],
    inUse: 1,
    batch: 'A',
    capacity: 1,
    takeOff: 'DD:DD',
    comments: 'EEEEEE',
    imageUrl: 'https://image-url',
    status: 'Active'
  };
  
  beforeEach(() => {
    jest.spyOn(Cache, 'save').mockResolvedValue();
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  afterAll(() => sequelize.close());

  describe('RouteService_createRouteBatch', () => {
    beforeEach(() => {
      jest.spyOn(RouteService, 'createBatch').mockResolvedValue(routeCreationResult);
      jest.spyOn(RouteService, 'updateBatchLabel').mockResolvedValue('B');
      jest.spyOn(RouteService, 'getRouteById').mockResolvedValue(route);
      jest.spyOn(routeService, 'findById').mockResolvedValue({ route, created: true });
    });

    it('should create initial route batch', async () => {
      const createData = {
        routeId: 1,
        imageUrl: 'www.somepicture.com',
        capacity: 1,
        takeOff: '3:00',
        comments: 'its ok',
        name: 'AAAAAA',
        destinationName: 'BBBBBB',
      };

      const result = await routeService.createRouteBatch(createData);
      expect(result).toHaveProperty('capacity');
      expect(result).toHaveProperty('takeOff');
      expect(result).toHaveProperty('batch');
      expect(result).toHaveProperty('comments');
      expect(result).toHaveProperty('route');
      expect(result).toHaveProperty('inUse');
      expect(result).toEqual(routeCreationResult);
    });

    it('should automatically create new batch from existing route', async () => {
      const createData = {
        ...batchDetails,
        name: 'AAAAAA',
        destinationName: 'BBBBBB',
        vehicleRegNumber: 'CCCCCC'
      };
      await routeService.createRouteBatch(createData);
      expect(RouteService.updateBatchLabel).toHaveBeenCalled();
    });
  });

  describe('RouteService_createRoute', () => {
    beforeEach(() => {
      const created = true;
      const routeDetails = { dataValues: { ...route } };
      jest.spyOn(Route, 'findOrCreate').mockResolvedValue([routeDetails, created]);
    });
    it('should return created route details', async () => {
      const name = 'yaba';
      const imageUrl = 'imageUrl';
      const res = await RouteService.createRoute(
        { name, imageUrl, destinationId: routeBatch.route.destination }
      );
      expect(res).toHaveProperty('route');
      expect(res).toHaveProperty('created');
      expect(res).toEqual({ route, created: true });
      expect(Route.findOrCreate).toBeCalled();
      const calledWith = Route.findOrCreate.mock.calls[0][0];
      expect(calledWith).toHaveProperty('where');
      expect(calledWith).toHaveProperty('defaults');
    });
  });

  describe('RouteService_addUserToRoute', () => {
    beforeEach(() => {
      jest.spyOn(HttpError, 'throwErrorIfNull');
      jest.spyOn(UserService, 'getUserById');
      jest.spyOn(RouteBatch, 'findByPk');
      jest.spyOn(RouteServiceHelper, 'canJoinRoute');
      jest.spyOn(sequelize, 'transaction').mockImplementation((fn) => {
        fn();
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("should throw an error if route doesn't exists", async () => {
      RouteBatch.findByPk.mockResolvedValue(null);
      const userId = 2;
      const routeBatchId = 2;
      try {
        await RouteService.addUserToRoute(routeBatchId, userId);
      } catch (e) {
        expect(e.statusCode).toEqual(404);
        expect(RouteServiceHelper.canJoinRoute).not.toHaveBeenCalled();
        expect(HttpError.throwErrorIfNull.mock.calls[0][1]).toEqual(
          'Route route not found'
        );
      }
    });

    it('should add a user to the route', async () => {
      const userId = 3;
      const routeBatchId = 3;
      const mockRoute = {
        ...routeBatch,
        id: routeBatchId,
        capacity: 2,
        update: jest.fn().mockReturnValue({ id: 1 })
      };
      RouteBatch.findByPk.mockResolvedValue(mockRoute);
      const user = {
        update: jest.fn()
      };
      UserService.getUserById.mockResolvedValue(user);

      await RouteService.addUserToRoute(routeBatchId, userId);

      expect(UserService.getUserById).toBeCalled();
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(user.update).toHaveBeenCalledWith({ routeBatchId });
      expect(mockRoute.update).toHaveBeenCalledWith({
        inUse: mockRoute.riders.length + 1
      });
    });

    it('should throw an error if route is filled to capacity', async () => {
      RouteBatch.findByPk.mockResolvedValue(routeBatch);
      const userId = 2;
      const routeBatchId = 2;
      try {
        await RouteService.addUserToRoute(routeBatchId, userId);
      } catch (e) {
        expect(e.statusCode).toEqual(403);
        expect(RouteServiceHelper.canJoinRoute).toHaveBeenCalled();
        expect(HttpError.throwErrorIfNull.mock.calls[1][2]).toEqual(403);
        expect(HttpError.throwErrorIfNull.mock.calls[1][1]).toEqual(
          'Route capacity has been exhausted'
        );
      }
    });
  });

  describe('RouteService_getRoute', () => {
    let findByPk;
    beforeEach(() => {
      findByPk = jest.spyOn(Route, 'findByPk');
    });
    afterEach(() => {
      jest.restoreAllMocks();
      jest.restoreAllMocks();
    });
    it('should save on database and cache', async () => {
      const id = 123;
      const mock = {
        ...routeBatch,
        id
      };
      findByPk.mockReturnValue(mock);
      const result = await RouteService.getRouteById(id, true);

      expect(findByPk).toHaveBeenCalled();

      expect(result).toEqual(mock);
    });
  });

  describe('RouteService_getRouteByName', () => {
    it('should return route details from the db', async () => {
      const mockRouteDetails = { id: 1, name: 'Yaba', imgUrl: 'images://an-img.png' };
      jest.spyOn(Route, 'findOne').mockResolvedValue(mockRouteDetails);
      const routeDetails = await routeService.getRouteByName('Yaba');
      expect(routeDetails).toEqual(mockRouteDetails);
    });
  });

  describe('RouteService_updateRouteBatch', () => {
    const mockResponse = [[], [routeBatch]];
    beforeEach(() => {
      jest.spyOn(RouteBatch, 'update').mockResolvedValue(mockResponse);
    });
    it('update route info and save it to cache', async () => {
      const id = 2;
      await RouteService.updateRouteBatch(id, firstRoute);
      expect(RouteBatch.update).toBeCalled();
    });
  });

  describe('RouteService_getRoutes', () => {
    beforeEach(() => {
      jest
        .spyOn(RouteBatch, 'findAll')
        .mockResolvedValue([routeBatch, { riders: [null] }]);
      jest.spyOn(RouteBatch, 'count').mockResolvedValue(10);
      jest.spyOn(Sequelize, 'fn').mockImplementation(() => 0);
    });
    it('should ', async () => {
      const result = await RouteService.getRoutes();

      expect(result).toHaveProperty('pageNo');
      expect(result.pageNo).toEqual(1);
      expect(result).toHaveProperty('itemsPerPage');
      expect(result).toHaveProperty('totalItems');
      expect(result).toHaveProperty('totalPages');
    });
    it('should return only active routes', async () => {
      const where = { status: 'Active' };
      const defaultInclude = [
        ...RouteService.updateDefaultInclude(where),
        { model: User, as: 'riders', attributes: [] }
      ];
      const attributes = [...RouteService.defaultRouteDetails];
      const group = [...RouteService.defaultRouteGroupBy];
      const expectedCallArgs = {
        include: defaultInclude,
        limit: 4294967295,
        offset: 0,
        order: [['id', 'asc']],
        subQuery: false,
        where,
        attributes: [[0, 'inUse'], ...attributes],
        group,
      };
      await RouteService.getRoutes(RouteService.defaultPageable, where);
      expect(RouteBatch.findAll).toHaveBeenCalledWith(expectedCallArgs);
    });
  });

  describe('RouteService_getRouteBatchByPk', () => {
    beforeEach(() => {
      jest.spyOn(RouteBatch, 'findByPk').mockResolvedValue([{}]);
    });
    it('should route batch', async () => {
      const id = 12;
      await RouteService.getRouteBatchByPk(id);
      expect(RouteBatch.findByPk).toBeCalled();
    });
  });

  describe('RouteService_serializeData', () => {
    it('should combine all route info into one object', () => {
      const res = RouteServiceHelper.serializeRouteBatch(routeBatch);
      expect(res).toHaveProperty('capacity');
      expect(res).toHaveProperty('driverPhoneNo');
      expect(res).toHaveProperty('regNumber');
      expect(res).toHaveProperty('status');
      expect(res).toHaveProperty('name');
      expect(res).toHaveProperty('batch');
      expect(res).toHaveProperty('destination');
      expect(res).toHaveProperty('imageUrl');
    });
  });

  describe('RouteService_convertToSequelizeOrderByClause', () => {
    it('should convert sort object to sequelize order array  ', () => {
      const sort = [
        { predicate: 'name', direction: 'asc' },
        { predicate: 'destination', direction: 'asc' },
        { predicate: 'driverName', direction: 'asc' },
        { predicate: 'driverPhoneNo', direction: 'asc' },
        { predicate: 'regNumber', direction: 'asc' }
      ];
      const result = RouteService.convertToSequelizeOrderByClause(sort);
      expect(result[0].length).toEqual(3);
      expect(result[0][0]).toEqual({ model: Route, as: 'route' });
      expect(result[0][1]).toEqual(sort[0].predicate);
      expect(result[0][2]).toEqual(sort[0].direction);

      expect(result[1].length).toEqual(4);
      expect(result[1][0]).toEqual({ model: Route, as: 'route' });
      expect(result[1][1]).toEqual({ model: Address, as: 'destination' });
      expect(result[1][2]).toEqual('address');
      expect(result[1][3]).toEqual(sort[1].direction);

      expect(result[2].length).toEqual(3);
      expect(result[2][0]).toEqual({ model: Cab, as: 'cabDetails' });
      expect(result[2][1]).toEqual(sort[2].predicate);
      expect(result[2][2]).toEqual(sort[2].direction);

      expect(result[3].length).toEqual(3);
      expect(result[3][0]).toEqual({ model: Cab, as: 'cabDetails' });
      expect(result[3][1]).toEqual(sort[3].predicate);
      expect(result[3][2]).toEqual(sort[3].direction);

      expect(result[4].length).toEqual(3);
      expect(result[4][0]).toEqual({ model: Cab, as: 'cabDetails' });
      expect(result[4][1]).toEqual(sort[4].predicate);
      expect(result[4][2]).toEqual(sort[4].direction);
    });
  });

  describe('RouteService_deleteRouteBatch', () => {
    it('should should perform soft delete', async () => {
      const routeBatchId = 1001;
      const spy = jest.spyOn(RouteBatch, 'destroy');
      await RouteService.deleteRouteBatch(routeBatchId);

      expect(spy).toHaveBeenCalled();
      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        {
          where: {
            id: routeBatchId
          }
        }
      );
    });
  });

  describe('RouteService_updateDefaultInclude', () => {
    it('should should update default include', () => {
      const where = {
        name: 'Island'
      };
      const result = RouteService.updateDefaultInclude(where);
      expect(result.length).toEqual(4);
      expect(result[2]).toHaveProperty('where');
      expect(result[2].where).toHaveProperty('name');
    });
  });
  describe('Route Ratings', () => {
    it('should execute query ', async () => {
      const mockData = [[]];
      const querySpy = jest.spyOn(sequelize, 'query');
      querySpy.mockReturnValue(mockData);
      const results = await RouteService.RouteRatings();
      expect(querySpy).toBeCalled();
      expect(results).toEqual(mockData);
    });
  });

  describe('RouteService > defaultRouteDetails', () => {
    it('should return a list of default values (route details)', () => {
      const expected = ['id', 'status', 'capacity', 'takeOff', 'batch', 'comments'];
      const values = RouteService.defaultRouteDetails;
      expect(values).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('RouteService > defaultRouteGroupBy', () => {
    it('should return a list of default groupBy values', () => {
      const expected = ['RouteBatch.id', 'cabDetails.id', 'route.id', 'route->destination.id'];
      const values = RouteService.defaultRouteGroupBy;
      expect(values).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('RouteService_getBatches', () => {
    it('should return list of route batches', async (done) => {
      jest.spyOn(RouteBatch, 'findAll').mockReturnValue({ datavalues: { routeBatch } });
      await RouteService.getBatches({ status: 'Active' });
      expect(RouteBatch.findAll).toHaveBeenCalled();
      done();
    });
  });
});
