import faker from 'faker';
import tripService, { TripService } from '../src/services/TripService';
import models from '../src/database/models';
import { createTripRequests, createUser } from './support/helpers';
import TravelTripService from '../src/services/TravelTripService';

describe('TripService', () => {
  const [testUserId, departmentId] = [2, 2];
  const testTrips = [];
  const tripsCount = 3;

  beforeAll(async () => {
    for (let count = 1; count < tripsCount; count += 1) {
      testTrips.push(TripService.createRequest({
        riderId: testUserId,
        name: 'Trip to London',
        reason: 'Testing the flow',
        departmentId,
        tripStatus: 'Pending',
        departureTime: new Date(
          new Date().getTime() - 864000000
        ).toLocaleString(),
        requestedById: testUserId,
        originId: 1,
        destinationId: 2,
        noOfPassengers: count,
        tripType: 'Regular Trip'
      }));
    }
    await Promise.all(testTrips);
  });

  afterAll(async () => {
    await models.sequelize.close();
  });

  describe('getPaginatedTrips', () => {
    it('should return paginated trips', async (done) => {
      const itemPerPage = 5;
      const response = await tripService.getPaginatedTrips({}, 1, itemPerPage);
      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.pageMeta).toBeDefined();
      done();
    });
  });

  describe('Travel Trips', () => {
    let mockUser;
    let mockedDepartment1;
    let mockedDepartment2;
    const mockedResponse1 = {
      departmentId: 1,
      departmentName: 'TDD',
      totalTrips: '2',
      averageRating: '2.5000000000000000',
      totalCost: '250'
    };
    const mockedResponse2 = {
      departmentId: 2,
      departmentName: 'Travel',
      totalTrips: '1',
      averageRating: '2.0000000000000000',
      totalCost: '50'
    };


    beforeAll(async () => {
      const userData = {
        name: faker.name.findName(),
        slackId: faker.random.word().toUpperCase(),
        phoneNo: faker.phone.phoneNumber('080########'),
        email: faker.internet.email(),
      };
      mockUser = await createUser(userData);

      mockedDepartment1 = await models.Department.findByPk(1, { plain: true });
      mockedDepartment2 = await models.Department.findByPk(2, { plain: true });


      const trips = [
        {
          id: 70,
          riderId: mockUser.id,
          name: 'Trip to London',
          reason: 'Testing the flow',
          departmentId: mockedDepartment1.id,
          tripStatus: 'Completed',
          departureTime: new Date('2019-07-18 08:00'),
          requestedById: mockUser.id,
          originId: 1,
          destinationId: 2,
          noOfPassengers: 1,
          tripType: 'Embassy Visit',
          cost: 100,
          createdAt: new Date('2019-07-15 08:00'),
          rating: 2,
          homebaseId: 1

        },
        {
          id: 72,
          riderId: mockUser.id,
          name: 'Trip to London',
          reason: 'Testing the flow',
          departmentId: mockedDepartment1.id,
          tripStatus: 'Completed',
          departureTime: new Date('2019-07-18 08:40'),
          requestedById: mockUser.id,
          originId: 1,
          destinationId: 2,
          noOfPassengers: 1,
          tripType: 'Embassy Visit',
          cost: 150,
          createdAt: new Date('2019-07-14 08:00'),
          rating: 3,
          homebaseId: 1

        },
        {
          id: 73,
          riderId: mockUser.id,
          name: 'Trip to London',
          reason: 'Testing the flow',
          departmentId: mockedDepartment2.id,
          tripStatus: 'Completed',
          departureTime: new Date('2019-06-17 08:00'),
          requestedById: mockUser.id,
          originId: 1,
          destinationId: 2,
          noOfPassengers: 1,
          tripType: 'Airport Transfer',
          cost: 50,
          createdAt: new Date('2019-06-15 08:00'),
          rating: 2,
          homebaseId:1
        }
      ];

      await createTripRequests(trips);
    });

    afterAll(async () => {
      await models.TripRequest.destroy({ where: { id: [70, 72, 73] } });
      await models.sequelize.close();
    });

    it('should Travel trips for only specified departments', async () => {
      const startDate = '2019-06-02 08:00';
      const endDate = '2019-08-02 08:00';
      const departmentList = [mockedDepartment1.name];

      const response = await TravelTripService.getCompletedTravelTrips(
        startDate, endDate, departmentList, 1
      );
      expect(response).toStrictEqual([mockedResponse1]);
    });

    it('should Travel trips for only specified period', async () => {
      const startDate = '2019-07-13 08:00';
      const endDate = '2019-07-15 09:00';

      const departmentList = [mockedDepartment1.name];

      const response = await TravelTripService.getCompletedTravelTrips(
        startDate, endDate, departmentList, 1
      );
      expect(response).toStrictEqual([mockedResponse1]);
    });


    it('should  Completed Travel trips', async () => {
      const startDate = '2019-06-02 08:00';
      const endDate = '2019-08-02 08:00';
      const departmentList = [mockedDepartment1.name, mockedDepartment2.name];

      const response = await TravelTripService.getCompletedTravelTrips(
        startDate, endDate, departmentList, 1
      );
      const mockedResponse = [
        mockedResponse1,
        mockedResponse2
      ];
      expect(response).toStrictEqual(mockedResponse);
    });
  });
});
