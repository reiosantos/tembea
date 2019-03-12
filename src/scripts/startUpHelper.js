import dotenv from 'dotenv';
import bugsnagHelper from '../helpers/bugsnagHelper';
import models from '../database/models';
import RoleService from '../services/RoleService';

dotenv.config();

const { User } = models;

class StartUpHelper {
  static async ensureSuperAdminExists() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const slackId = process.env.SUPER_ADMIN_SLACK_ID;

    try {
      const [user] = await User.findOrCreate({
        where: {
          email
        },
        defaults: {
          slackId,
          name: 'Tembea SuperAdmin'
        }
      });
      const [role] = await RoleService.createOrFindRole('Super Admin');

      await user.addRoles(role);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }
}


export default StartUpHelper;
