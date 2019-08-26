import { BaseService } from '../shared/base.service';
import User from '../../database/models/user';

export class UserService extends BaseService<User, number> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string) {
    return this.findOneByProp({ prop: 'email', value: email });
  }
}

const userService = new UserService();

export default userService;
