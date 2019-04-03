import UserService from '../UserService';
import models from '../../database/models';

const { User } = models;


describe('/Users service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not be able to create user', async (done) => {
    try {
      await UserService.createNewUser(1);
    } catch (error) {
      expect(error.message).toBe('Could not create user');
    }
    done();
  });

  it('should not get User SlackInfo', async (done) => {
    try {
      await UserService.getUserSlackInfo(1);
    } catch (error) {
      expect(error.message).toBe(
        'User not found. If your are providing a newEmail,'
        + ' it must be the same as the user\'s email on slack'
      );
    }
    done();
  });

  it('should not update the user record', async (done) => {
    try {
      await UserService.getUser({});
    } catch (error) {
      expect(error.message).toBe('Could not update the user record');
    }
    done();
  });

  it('should not update the user in the database', async (done) => {
    try {
      await UserService.saveNewRecord({});
    } catch (error) {
      expect(error.message).toBe('Could not update user record');
    }
    done();
  });

  describe('getUserById', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      User.findByPk = jest.fn().mockResolvedValue({});
    });

    it('should return valid user when found', async (done) => {
      const user = await UserService.getUserById(1);
      expect(user).toBeInstanceOf(Object);
      done();
    });
  });

  describe('getUserBySlackId', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      User.findOne = jest.fn().mockResolvedValue({});
    });

    it('should return valid user when found', async (done) => {
      const user = await UserService.getUserBySlackId(1);
      expect(user).toBeInstanceOf(Object);
      done();
    });
  });

  describe('getUserByEmail', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      User.findOne = jest.fn().mockResolvedValue({});
    });

    it('should return valid user when found', async (done) => {
      const user = await UserService.getUserByEmail(1);
      expect(user).toBeInstanceOf(Object);
      done();
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
});
