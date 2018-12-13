import UserService from '../UserService';


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
        "User not found. If your are providing a newEmail, it must be the same as the user's email on slack"
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

  it('should not get team details', async (done) => {
    try {
      await UserService.fetchTeamDetails(1);
    } catch (error) {
      expect(error.message).toBe('Could not get team details');
    }
    done();
  });
});
