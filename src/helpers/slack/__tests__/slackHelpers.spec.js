import models from '../../../database/models';
import SlackHelpers from '../slackHelpers';
import TeamDetailsService from '../../../services/TeamDetailsService';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import {
  departmentMocks, testUserFromDb, testTripFromDb, slackUserMock, testDepartmentFromDb
} from '../__mocks__';
import UserService from '../../../services/UserService';

const { TripRequest, User, Department } = models;

// setup for all
const webClientMock = {
  users: {
    info: jest.fn(() => Promise.resolve({
      user: slackUserMock,
      token: 'sdf'
    })),
    profile: {
      get: jest.fn(() => Promise.resolve({
        profile: {
          tz_offset: 'someValue',
          email: 'sekito.ronald@andela.com'
        }
      }))
    }
  }
};

describe('slackHelpers', () => {
  beforeEach(() => {
    jest.spyOn(WebClientSingleton.prototype, 'getWebClient').mockReturnValue(webClientMock);

    jest.spyOn(User, 'findOne').mockResolvedValue(testUserFromDb);
    jest.spyOn(User, 'findByPk').mockResolvedValue(testUserFromDb);
    jest.spyOn(User, 'findOrCreate').mockResolvedValue([{ dataValues: testUserFromDb.dataValues }]);
    jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(testUserFromDb);

    jest.spyOn(TripRequest, 'findByPk').mockResolvedValue(testTripFromDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getDepartments', () => {
    beforeAll(() => {
      jest.spyOn(Department, 'findAll').mockResolvedValue(departmentMocks);
    });

    it('should return an array with department entries', async (done) => {
      const departments = await SlackHelpers.getDepartments();

      expect(departments).toBeInstanceOf(Array);
      expect(departments).toHaveLength(departmentMocks.length);
      expect(departments[0].head).toBeDefined();
      done();
    });
  });

  describe('getHeadByDepartmentId', () => {
    it('should return a user object', async (done) => {
      jest.spyOn(Department, 'findByPk').mockResolvedValue(testDepartmentFromDb);

      const head = await SlackHelpers.getHeadByDepartmentId(1);
      expect(head).toBeInstanceOf(Object);
      expect(head).toEqual(testUserFromDb.dataValues);
      done();
    });
  });

  describe('fetchUserInformationFromSlack', () => {
    it('should call WebClientSingleton.getWebClient', async (done) => {
      // invoke
      const slackUser = await SlackHelpers.fetchUserInformationFromSlack('slackId', 'token');

      expect(typeof slackUser).toEqual('object');
      expect(slackUser).toEqual(slackUserMock);
      done();
    });
  });

  describe('getUserInfoFromSlack', () => {
    it('should return user info from slack', async (done) => {
      const slackId = 'U145';
      const teamId = 'TS14';
      const token = 'token';
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue(token);
      SlackHelpers.fetchUserInformationFromSlack = jest
        .fn()
        .mockResolvedValue({ user: slackUserMock });

      const slackUser = await SlackHelpers.getUserInfoFromSlack(slackId, teamId);

      expect(TeamDetailsService.getTeamDetailsBotOauthToken).toBeCalledWith(teamId);
      expect(SlackHelpers.fetchUserInformationFromSlack).toBeCalledWith(slackId, token);
      expect(slackUser).toBeInstanceOf(Object);
      expect(slackUser.user).toEqual(slackUserMock);
      done();
    });
  });

  describe('createUserFromSlackUserInfo', () => {
    it('should create a user object based on given slack user info', async (done) => {
      jest.spyOn(User, 'findOrCreate').mockResolvedValue([{ dataValues: testUserFromDb.dataValues }]);
      const user = await SlackHelpers.createUserFromSlackUserInfo(slackUserMock);
      const expected = {
        where: { slackId: slackUserMock.id },
        defaults: { name: slackUserMock.real_name, email: slackUserMock.profile.email }
      };
      expect(User.findOrCreate).toBeCalledWith(expected);
      expect(user).toEqual(testUserFromDb.dataValues);
      done();
    });
  });

  describe('findOrCreateUserFromSlackId', () => {
    const userId = 1;
    const teamId = 'U1GHSGS';
    const validUser = { id: teamId, email: 'tembea@andela.com' };
    beforeEach(() => {
      // create expected results
      jest.spyOn(SlackHelpers, 'getUserInfoFromSlack').mockResolvedValue(slackUserMock);
      jest.spyOn(SlackHelpers, 'createUserFromSlackUserInfo').mockResolvedValue(validUser);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create and return new user if user does not exist', async (done) => {
      // mock dependencies and return expected values
      const nullUser = undefined;
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(nullUser);

      // test expected behavior
      const user = await SlackHelpers.findOrCreateUserBySlackId(userId, teamId);
      expect(UserService.getUserBySlackId).toBeCalledWith(userId);
      expect(SlackHelpers.getUserInfoFromSlack).toBeCalledWith(userId, teamId);
      expect(SlackHelpers.createUserFromSlackUserInfo).toBeCalledWith(slackUserMock);
      expect(user).toEqual(validUser);
      done();
    });

    it('should return user based on slackId if user already exists', async (done) => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(validUser);
      const user = await SlackHelpers.findOrCreateUserBySlackId(userId, teamId);
      expect(UserService.getUserBySlackId).toBeCalledWith(userId);
      expect(SlackHelpers.getUserInfoFromSlack).toBeCalledTimes(0);
      expect(SlackHelpers.createUserFromSlackUserInfo).toBeCalledTimes(0);
      expect(user).toEqual(validUser);
      done();
    });
  });

  describe('findUserByIdOrSlackId', () => {
    it('should return user object when slackId is valid', async (done) => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(testUserFromDb);
      const user = await SlackHelpers.findUserByIdOrSlackId('U4500');
      expect(UserService.getUserBySlackId).toBeCalledTimes(1);
      expect(UserService.getUserBySlackId).toBeCalledWith('U4500');
      expect(user).toEqual(testUserFromDb.dataValues);
      done();
    });

    it('should return user object when id is valid', async (done) => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(testUserFromDb);
      const user = await SlackHelpers.findUserByIdOrSlackId(10);
      expect(UserService.getUserById).toBeCalledTimes(1);
      expect(UserService.getUserById).toBeCalledWith(10);
      expect(user).toEqual(testUserFromDb.dataValues);
      done();
    });
  });

  describe('isRequestApproved', () => {
    it('should return trip status object with approved false', async (done) => {
      TripRequest.findByPk = jest.fn(() => Promise.resolve({}));
      const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
      expect(trip).toEqual({ approvedBy: null, isApproved: false });
      done();
    });

    it('should return a valid approval status when request exists', async (done) => {
      jest.spyOn(TripRequest, 'findByPk').mockResolvedValue(testTripFromDb);
      jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId').mockResolvedValue(testUserFromDb.dataValues);
      const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
      expect(trip).toEqual({
        approvedBy: `<@${testUserFromDb.dataValues.slackId}>`, isApproved: true
      });
      done();
    });
  });

  describe('approveRequest', () => {
    it('should approve request when parameters is valid', async (done) => {
      const thisTripRequest = testTripFromDb;
      jest.spyOn(thisTripRequest, 'update').mockResolvedValue({});
      jest.spyOn(SlackHelpers, 'findUserByIdOrSlackId').mockResolvedValue({ id: 5 });

      const tripStatus = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
      expect(thisTripRequest.update).toBeCalledTimes(1);
      expect(tripStatus).toBeTruthy();
      done();
    });

    it('should return false when trip is not found', async (done) => {
      jest.spyOn(TripRequest, 'findByPk').mockResolvedValue(undefined);
      const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
      expect(trip).toBeFalsy();
      done();
    });

    it('should return false if manager is not found', async (done) => {
      jest.spyOn(TripRequest, 'findByPk').mockResolvedValue(testTripFromDb);
      SlackHelpers.findUserByIdOrSlackId = jest.fn(() => Promise.resolve({}));
      const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
      expect(trip).toBeFalsy();
      done();
    });
  });

  describe('handleCancellation', () => {
    it('should return true/false when trip status is Cancelled', async (done) => {
      const tripRequest = {
        tripStatus: 'Cancelled'
      };
      jest.spyOn(SlackHelpers, 'getTripRequest').mockImplementation().mockResolvedValue(tripRequest);
      const result = await SlackHelpers.handleCancellation();

      expect(result).toEqual(true);

      done();
    });
  });

  describe('findOrCreateUserBySlackId', () => {
    beforeEach(() => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue();
      jest.spyOn(SlackHelpers, 'getUserInfoFromSlack').mockResolvedValue({});
      jest.spyOn(SlackHelpers, 'createUserFromSlackUserInfo').mockReturnValue({
        username: 'santos',
        email: 'tembea@tem.com'
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should return new user when user isn't found", async (done) => {
      const result = await SlackHelpers.findOrCreateUserBySlackId('1aaaBa', 'TI34DJ');
      expect(result).toEqual({ username: 'santos', email: 'tembea@tem.com' });
      expect(UserService.getUserBySlackId).toHaveBeenCalledTimes(1);
      expect(SlackHelpers.createUserFromSlackUserInfo).toHaveBeenCalledTimes(1);
      done();
    });

    it('should return null when user is found', async (done) => {
      UserService.getUserBySlackId = jest.fn(() => ({}));
      const result = await SlackHelpers.findOrCreateUserBySlackId('1aaaBa', 'TI34DJ');
      expect(UserService.getUserBySlackId).toHaveBeenCalled();
      expect(SlackHelpers.createUserFromSlackUserInfo).toHaveBeenCalledTimes(0);
      expect(result).toEqual({});
      done();
    });
  });

  describe('getTriprequest', () => {
    it('should return valid trip request if id exists', async () => {
      const result = await SlackHelpers.getTripRequest(1, {});
      expect(result).toEqual(testTripFromDb.dataValues);
    });
  });

  describe('noOfPassengers', () => {
    it('should return name value pairs', () => {
      const result = SlackHelpers.noOfPassengers();
      expect(result.length === 10);
      expect(result[0]).toHaveProperty('text');
      expect(result[0]).toHaveProperty('value');
    });
  });
});
