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
jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    users: {
      info: jest.fn(() => Promise.resolve({
        user: { real_name: 'someName', profile: { email: 'someemial@email.com' } },
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
  }))
}));

const webClient = {
  users: {
    info: () => ({
      user: slackUserMock
    })
  }
};

WebClientSingleton.prototype.getWebClient = () => webClient;

User.findOne = jest.fn().mockResolvedValue(testUserFromDb);
User.findByPk = jest.fn().mockResolvedValue(testUserFromDb);
User.findOrCreate = jest.fn().mockResolvedValue([{ dataValues: testUserFromDb.dataValues }]);
User.getUserBySlackId = jest.fn().mockResolvedValue(testUserFromDb);

TripRequest.findByPk = jest.fn().mockResolvedValue(testTripFromDb);

describe('slackHelpers_getDepartments', () => {
  beforeAll(() => {
    jest.resetAllMocks();
    Department.findAll = jest.fn().mockResolvedValue(departmentMocks);
  });

  it('should return an array with department entries', async (done) => {
    const departments = await SlackHelpers.getDepartments();

    expect(departments).toBeInstanceOf(Array);
    expect(departments).toHaveLength(departmentMocks.length);
    expect(departments[0].head).toBeDefined();
    done();
  });
});

describe('slackHelpers_getHeadByDepartmentId', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a user object', async (done) => {
    Department.findByPk = jest.fn().mockResolvedValue(testDepartmentFromDb);

    const head = await SlackHelpers.getHeadByDepartmentId(1);
    expect(head).toBeInstanceOf(Object);
    expect(head).toEqual(testUserFromDb.dataValues);
    done();
  });
});

describe('slackHelpers_fetchUserInformationFromSlack', () => {
  beforeAll(() => jest.clearAllMocks());
  // arrange
  it('should call WebClientSingleton.getWebClient', async (done) => {
    // invoke
    const slackUser = await SlackHelpers.fetchUserInformationFromSlack('slackId', 'token');

    expect(typeof slackUser).toEqual('object');
    expect(slackUser).toEqual(slackUserMock);
    done();
  });
});

describe('slackHelpers_getUserInfoFromSlack', () => {
  beforeEach(() => jest.clearAllMocks());
  it('should return user info from slack', async (done) => {
    const slackId = 'U145';
    const teamId = 'TS14';
    const token = 'token';
    TeamDetailsService.getTeamDetailsBotOauthToken = jest.fn().mockResolvedValue(token);
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

describe('slackHelpers_createUserFromSlackUserInfo', () => {
  it('should create a user object based on given slack user info', async (done) => {
    User.findOrCreate = jest.fn().mockResolvedValue([{ dataValues: testUserFromDb.dataValues }]);
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

describe('slackHelpers_findOrCreateUserFromSlackId', () => {
  const userId = 1;
  const teamId = 'U1GHSGS';
  const validUser = { id: teamId, email: 'tembea@andela.com' };
  beforeAll(() => {
    // create expected results
    SlackHelpers.getUserInfoFromSlack = jest.fn().mockResolvedValue(slackUserMock);
    SlackHelpers.createUserFromSlackUserInfo = jest.fn().mockResolvedValue(validUser);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should create and return new user if user does not exist', async (done) => {
    // mock dependencies and return expected values
    const nullUser = undefined;
    UserService.getUserBySlackId = jest.fn().mockResolvedValue(nullUser);

    // test expected behavior
    const user = await SlackHelpers.findOrCreateUserBySlackId(userId, teamId);
    expect(UserService.getUserBySlackId).toBeCalledWith(userId);
    expect(SlackHelpers.getUserInfoFromSlack).toBeCalledWith(userId, teamId);
    expect(SlackHelpers.createUserFromSlackUserInfo).toBeCalledWith(slackUserMock);
    expect(user).toEqual(validUser);
    done();
  });

  it('should return user based on slackId if user already exists', async (done) => {
    UserService.getUserBySlackId = jest.fn().mockResolvedValue(validUser);
    const user = await SlackHelpers.findOrCreateUserBySlackId(userId, teamId);
    expect(UserService.getUserBySlackId).toBeCalledWith(userId);
    expect(SlackHelpers.getUserInfoFromSlack).toBeCalledTimes(0);
    expect(SlackHelpers.createUserFromSlackUserInfo).toBeCalledTimes(0);
    expect(user).toEqual(validUser);
    done();
  });
});

describe('slackHelpers_findUserByIdOrSlackId', () => {
  it('should return user object when slackId is valid', async (done) => {
    UserService.getUserBySlackId = jest.fn().mockResolvedValue(testUserFromDb);
    const user = await SlackHelpers.findUserByIdOrSlackId('U4500');
    expect(UserService.getUserBySlackId).toBeCalledTimes(1);
    expect(UserService.getUserBySlackId).toBeCalledWith('U4500');
    expect(user).toEqual(testUserFromDb.dataValues);
    done();
  });

  it('should return user object when id is valid', async (done) => {
    UserService.getUserById = jest.fn().mockResolvedValue(testUserFromDb);
    const user = await SlackHelpers.findUserByIdOrSlackId(10);
    expect(UserService.getUserById).toBeCalledTimes(1);
    expect(UserService.getUserById).toBeCalledWith(10);
    expect(user).toEqual(testUserFromDb.dataValues);
    done();
  });
});

describe('slackHelpers_isRequestApproved', () => {
  it('should return trip status object with approved false', async (done) => {
    TripRequest.findByPk = jest.fn(() => Promise.resolve({}));
    const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
    expect(trip).toEqual({ approvedBy: null, isApproved: false });
    done();
  });

  it('should return a valid approval status when request exists', async (done) => {
    TripRequest.findByPk = jest.fn().mockResolvedValue(testTripFromDb);
    SlackHelpers.findUserByIdOrSlackId = jest.fn().mockResolvedValue(testUserFromDb.dataValues);
    const trip = await SlackHelpers.isRequestApproved(23, 'UE45');
    expect(trip).toEqual({
      approvedBy: `<@${testUserFromDb.dataValues.slackId}>`, isApproved: true
    });
    done();
  });
});

describe('slackHelpers_approveRequest', () => {
  beforeEach(() => jest.resetAllMocks());
  it('should approve request when parameters is valid', async (done) => {
    const thisTripRequest = testTripFromDb;
    thisTripRequest.update = jest.fn().mockResolvedValue({});
    TripRequest.findByPk = jest.fn().mockResolvedValue(thisTripRequest);
    SlackHelpers.findUserByIdOrSlackId = jest.fn().mockResolvedValue({ id: 5 });

    const tripStatus = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
    expect(thisTripRequest.update).toBeCalledTimes(1);
    expect(tripStatus).toBeTruthy();
    done();
  });

  it('should return false when trip is not found', async (done) => {
    TripRequest.findByPk = jest.fn().mockResolvedValue(undefined);
    const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
    expect(trip).toBeFalsy();
    done();
  });

  it('should return false if manager is not found', async (done) => {
    TripRequest.findByPk = jest.fn().mockResolvedValue(testTripFromDb);
    SlackHelpers.findUserByIdOrSlackId = jest.fn(() => Promise.resolve({}));
    const trip = await SlackHelpers.approveRequest(23, 'UE45', 'some text');
    expect(trip).toBeFalsy();
    done();
  });
});
