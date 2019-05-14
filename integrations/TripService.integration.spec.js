import Utils from '../src/utils';
import tripService, { TripService } from '../src/services/TripService';
import models from '../src/database/models';

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
});
