import UserService from '../UserService';
import models from '../../database/models';

const { User } = models;


describe('/Users service', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
    beforeEach(() => {
      jest.resetAllMocks();
      User.findByPk = jest.fn().mockResolvedValue({});
    });

    it('should return valid user when found', async () => {
      const user = await UserService.getUserById(1);
      expect(user).toBeInstanceOf(Object);
    });
  });

  describe('getUserBySlackId', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      User.findOne = jest.fn().mockResolvedValue({});
    });

    it('should return valid user when found', async () => {
      const user = await UserService.getUserBySlackId(1);
      expect(user).toBeInstanceOf(Object);
    });
  });

  describe('getUserByEmail', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      User.findOne = jest.fn().mockResolvedValue({});
    });

    it('should return valid user when found', async () => {
      const user = await UserService.getUserByEmail(1);
      expect(user).toBeInstanceOf(Object);
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
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should get fellows not on route', async () => {
      const data = await UserService.getPagedFellowsOnOrOffRoute(false, 1, 1);
      expect(data.data).toBeDefined();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pageMeta).toBeDefined();
      expect(data.pageMeta).toBeInstanceOf(Object);
    });

    it('should get fellows on route', async () => {
      const data = await UserService.getPagedFellowsOnOrOffRoute(true, 1, 1);
      expect(data.data).toBeDefined();
      expect(data.data).toBeInstanceOf(Array);
      expect(data.pageMeta).toBeDefined();
      expect(data.pageMeta).toBeInstanceOf(Object);
    });
  });
});
