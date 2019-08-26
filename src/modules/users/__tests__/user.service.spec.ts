import { UserService } from '../user.service';
import database from '../../../database';
import User from '../../../database/models/user';
import faker from 'faker';
import { Repository } from 'sequelize-typescript';
import { IUser } from '../../../database/models/interfaces/user.interface';

describe(UserService, () => {
  let userService: UserService;
  let userRepo: Repository<User>;

  beforeAll(() => {
    userService = new UserService();
    userRepo = database.getRepository(User);
  });

  afterAll(done => database.close().then(done));

  it('should export a default instance', () => {
    expect(userService).toBeDefined();
  });

  describe(UserService.prototype.add, () => {
    it('should add a new entry to user table', async () => {
      const testUser = {
        name: faker.fake('{{name.lastName}}, {{name.firstName}}'),
        email:  faker.internet.email(),
        slackId: faker.random.alphaNumeric(8),
        phoneNo: faker.phone.phoneNumber(),
      };
      const oldTotalUsers = await userRepo.count();

      await userService.add(testUser);

      const newTotalUsers = await userRepo.count();
      expect(oldTotalUsers).toEqual(newTotalUsers - 1);
    });
  });

  describe(UserService.prototype.findByEmail, () => {
    const sampleUser: IUser = {
      name: 'Sample User',
      email: 'example@emails.com',
      phoneNo: '000100020212',
      slackId: 'U34HTY6G',
    };

    beforeAll(done => userRepo.create(sampleUser).then(() => done()));

    it('should return specified user', async () => {
      const result = await userService.findByEmail(sampleUser.email);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', sampleUser.name);
    });
  });
});
