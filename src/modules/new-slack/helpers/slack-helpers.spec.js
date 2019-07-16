import NewSlackHelpers from './slack-helpers';
import userTripActions from '../trips/user/actions';
import userTripBlocks from '../trips/user/blocks';
import tripPaymentSchema, { tripReasonSchema } from '../trips/schemas';
import UserService from '../../../services/UserService';
import { testUserFromDb, slackUserMock, createNewUserMock } from '../../../helpers/slack/__mocks__';
import WebClientSingleton from '../../../utils/WebClientSingleton';
import TeamDetailsService from '../../../services/TeamDetailsService';
import { Cache } from '../../slack/RouteManagement/rootFile';

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
    jest.spyOn(WebClientSingleton, 'getWebClient').mockReturnValue(webClientMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('toSlackDropdown', () => {
    it('should convert any array to an array with text and value fields', () => {
      const data = [{ text: 'Hello', value: 1 }, { text: 'World', value: 2 }];

      const result = NewSlackHelpers.toSlackDropdown(data);
      expect(result.length).toEqual(data.length);
    });
  });

  describe('getDestinationFields, getPickupFields, getNavBlock', () => {
    it('should return destination fields', async () => {
      const destinationFields = await NewSlackHelpers.getDestinationFields();
      expect(destinationFields).toBeDefined();
      expect(destinationFields[0].name).toEqual('destination');
      expect(destinationFields[1].name).toEqual('othersDestination');
    });

    it('should return pickup fields', async () => {
      const pickupFields = await NewSlackHelpers.getPickupFields();
      expect(pickupFields).toBeDefined();
      expect(pickupFields[0].name).toEqual('dateTime');
    });

    it('should return nav block', async () => {
      const navBlock = await NewSlackHelpers.getNavBlock(userTripBlocks.navBlock, 'back', userTripActions.getDepartment);
      expect(navBlock.block_id).toEqual(userTripBlocks.navBlock);
      expect(navBlock.elements[0].value).toEqual(userTripActions.getDepartment);
    });
  });

  describe('dialogValidator', () => {
    it('should validate data from a dialog', () => {
      const data = { reason: 'Good reason' };
      const validate = NewSlackHelpers.dialogValidator(data, tripReasonSchema);
      expect(validate).toBeDefined();
      expect(validate).toEqual(data);
    });

    it('Should not validate data: Validation fail', () => {
      const data = {};
      try {
        NewSlackHelpers.dialogValidator(data, tripReasonSchema);
      } catch (err) {
        expect(err.errors).toBeDefined();
        expect(err.errors[0].name).toEqual('reason');
      }
    });
  });

  describe('findUserByIdOrSlackId', () => {
    it('Should find a user with slackId', async () => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(testUserFromDb);
      const user = await NewSlackHelpers.findUserByIdOrSlackId('UJV7XF941');
      expect(user).toEqual(testUserFromDb.dataValues);
      expect(UserService.getUserBySlackId).toHaveBeenCalledWith('UJV7XF941');
    });

    it('Should find a user with an Id', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue(testUserFromDb);
      const user = await NewSlackHelpers.findUserByIdOrSlackId(7);
      expect(user).toEqual(testUserFromDb.dataValues);
      expect(UserService.getUserById).toHaveBeenCalledWith(7);
    });

    it('Should return undefined', async () => {
      jest.spyOn(UserService, 'getUserById').mockResolvedValue();
      const user = await NewSlackHelpers.findUserByIdOrSlackId(7);
      expect(user).toBeUndefined();
    });
  });

  describe('getUserInfo', () => {
    it('Should get user\'s info from slack', async () => {
      const user = await NewSlackHelpers.getUserInfo('FakeSlackId', 'fakeToken');
      expect(user).toEqual(slackUserMock);
    });

    it('Should get user info from the cache', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue(slackUserMock);
      const user = await NewSlackHelpers.getUserInfo('FakeSlackId', 'fakeToken');
      expect(user).toEqual(slackUserMock);
    });
  });
  describe('findOrCreateUserBySlackId', () => {
    const userId = 1;
    const teamId = 'U1GHSGS';
    const validUser = { id: teamId, email: 'tembea@andela.com' };
    beforeEach(() => {
      // create expected results
      jest.spyOn(NewSlackHelpers, 'getUserInfoFromSlack').mockResolvedValue(slackUserMock);
      jest.spyOn(UserService, 'createNewUser').mockResolvedValue(validUser);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create and return new user if user does not exist', async (done) => {
      // mock dependencies and return expected values
      const nullUser = undefined;
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(nullUser);

      // test expected behavior
      const user = await NewSlackHelpers.findOrCreateUserBySlackId(userId, teamId);
      expect(UserService.getUserBySlackId).toBeCalledWith(userId);
      expect(NewSlackHelpers.getUserInfoFromSlack).toBeCalledWith(userId, teamId);
      expect(UserService.createNewUser).toBeCalledWith(createNewUserMock);
      expect(user).toEqual(validUser);
      done();
    });

    it('should return user based on slackId if user already exists', async (done) => {
      jest.spyOn(UserService, 'getUserBySlackId').mockResolvedValue(validUser);
      const user = await NewSlackHelpers.findOrCreateUserBySlackId(userId, teamId);
      expect(UserService.getUserBySlackId).toBeCalledWith(userId);
      expect(NewSlackHelpers.getUserInfoFromSlack).toBeCalledTimes(0);
      expect(UserService.createNewUser).toBeCalledTimes(0);
      expect(user).toEqual(validUser);
      done();
    });
  });

  describe('fetchUserInformationFromSlack', () => {
    it('should call WebClientSingleton.getWebClient', async (done) => {
      // invoke
      const slackUser = await NewSlackHelpers.fetchUserInformationFromSlack('slackId', 'token');

      expect(typeof slackUser).toEqual('object');
      expect(slackUser).toEqual(slackUserMock);
      done();
    });
  });

  describe('getUserInfoFromSlack', () => {
    const slackId = 'U145';
    const teamId = 'TS14';
    const token = 'token';
    it('should return user info from slack', async (done) => {
      jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue(token);
      NewSlackHelpers.fetchUserInformationFromSlack = jest
        .fn()
        .mockResolvedValue({ user: slackUserMock });

      const slackUser = await NewSlackHelpers.getUserInfoFromSlack(slackId, teamId);

      expect(TeamDetailsService.getTeamDetailsBotOauthToken).toBeCalledWith(teamId);
      expect(NewSlackHelpers.fetchUserInformationFromSlack).toBeCalledWith(slackId, token);
      expect(slackUser).toBeInstanceOf(Object);
      expect(slackUser.user).toEqual(slackUserMock);
      done();
    });

    it('should return user info that already exist', async () => {
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ slackInfo: slackUserMock });
      const slackUser = await NewSlackHelpers.getUserInfoFromSlack(slackId, teamId);
      expect(slackUser).toBeInstanceOf(Object);
      expect(slackUser).toEqual(slackUserMock);
    });
  });

  describe('dialogValidator', () => {
    it('should validate data from a dialog', () => {
      const data = { price: 200 };
      const validate = NewSlackHelpers.dialogValidator(data, tripPaymentSchema);
      expect(validate).toBeDefined();
      expect(validate).toEqual(data);
    });
  
    it('Should not validate data: Validation fail', () => {
      const data = { price: 'test' };
      try {
        NewSlackHelpers.dialogValidator(data, tripPaymentSchema);
      } catch (err) {
        expect(err.errors).toBeDefined();
        expect(err.errors[0].name).toEqual('price');
      }
    });
  });
});
