import faker from 'faker';
import UserService from '../UserService';
import database from '../../database';

const { models: { User } } = database;

afterAll(() => {
  database.close();
});


describe('/Users service', () => {
  beforeEach(() => {
    jest.spyOn(User, 'findOne').mockResolvedValue({
      name: 'John Doe',
      email: 'johndoe@email.com',
      get: jest.fn().mockReturnThis(),
    });
  });

  it('should not be able to create user', async () => {
    try {
      await UserService.createNewUser(1);
    } catch (error) {
      expect(error.message).toBe('Could not create user');
    }
  });

  it('should not get User SlackInfo', async () => {
    try {
      await UserService.getUserSlackInfo(1);
    } catch (error) {
      expect(error.message).toBe(
        'User not found. If your are providing a newEmail,'
        + ' it must be the same as the user\'s email on slack'
      );
    }
  });

  it('should not update the user record', async () => {
    try {
      await UserService.getUser({});
    } catch (error) {
      expect(error.message).toBe('Could not update the user record');
    }
  });

  it('should not update the user in the database', async () => {
    try {
      await UserService.saveNewRecord({});
    } catch (error) {
      expect(error.message).toBe('Could not update user record');
    }
  });

  describe('getUserById', () => {
    it('should return valid user when found', async () => {
      jest.spyOn(User, 'findByPk').mockResolvedValue({});
      const user = await UserService.getUserById(1);
      expect(user).toBeInstanceOf(Object);
    });
  });

  describe('getUserBySlackId', () => {
    it('should return valid user when found', async () => {
      const user = await UserService.getUserBySlackId(1);
      expect(user).toBeInstanceOf(Object);
    });
  });

  describe('getUserByEmail', () => {
    it('should return valid user when found', async () => {
      const user = await UserService.getUserByEmail(1);
      expect(user).toBeInstanceOf(Object);
    });
    it('should return just the user object', async () => {
      const user = await UserService.getUserByEmail(1, { plain: true });
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('johndoe@email.com');
    });
  });

  describe('updateUser', () => {
    it('should update a user object', async () => {
      const updateSpy = jest.spyOn(User, 'update').mockResolvedValue({});

      const result = await UserService.updateUser(4, { routeBatchId: 2 });
      expect(result).toEqual({});
      expect(updateSpy).toBeCalledWith(
        { routeBatchId: 2 },
        { returning: true, where: { id: 4 } }
      );
    });
  });
  describe('getPagedFellowsOnOrOffRoute', () => {
    it('should get fellows not on route', async () => {
      const data = await UserService.getPagedFellowsOnOrOffRoute(false,
        { page: 1, size: 1 }, { homebaseId: 1 });
      expect(data.data).toBeDefined();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pageMeta).toBeDefined();
      expect(data.pageMeta).toBeInstanceOf(Object);
    });

    it('should get fellows on route', async () => {
      const data = await UserService
        .getPagedFellowsOnOrOffRoute(true, { size: 1, page: 1 }, { homebaseId: 1 });
      expect(data.data).toBeDefined();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pageMeta).toBeDefined();
      expect(data.pageMeta).toBeInstanceOf(Object);
    });
  });
  describe('findOrCreateNewUserWithSlackId', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should find or create a fellow by specific slackId', async () => {
      const userData = {
        slackId: faker.random.word(),
        name: faker.name.firstName(),
        email: faker.internet.email(),
      };
      const result = await UserService.findOrCreateNewUserWithSlackId(userData);
      expect(result.slackId).toBe(userData.slackId);
      expect(result.email).toBe(userData.email);
    });
  });
  it('should update homebase id of user', async () => {
    jest.spyOn(UserService, 'getUserBySlackId').mockReturnValue({ dataValues: { id: 1 } });
    jest.spyOn(UserService, 'updateUser');
    const homeBaseId = await UserService.updateDefaultHomeBase('UDL123', 1);
    expect(homeBaseId).toBe(1);
    expect(UserService.updateUser).toBeCalledWith(1, { homebaseId: 1 });
  });

  describe('createUserByEmail', () => {
    let mockGetUserInfo;
    let mockCreateUser;

    beforeEach(() => {
      mockGetUserInfo = jest.spyOn(UserService, 'getUserInfo');
      mockCreateUser = jest.spyOn(UserService, 'createNewUser');
    });

    it('should create a user if they do not exists', async () => {
      mockGetUserInfo.mockResolvedValue(null);
      const response = await UserService.createUserByEmail(
        'team.slack.com', 'email@email.com'
      );
      expect(response).toBeFalsy();
    });

    it('should create a user if they do not exists', async () => {
      mockGetUserInfo.mockResolvedValue(true);
      mockCreateUser.mockResolvedValue({ id: 1, name: 'user name' });
      const response = await UserService.createUserByEmail(
        'team.slack.com', 'email@email.com'
      );
      expect(response).toBeTruthy();
    });
  });
});
