import dotenv from 'dotenv';
import bugsnagHelper from '../helpers/bugsnagHelper';
import models from '../database/models';
import RoleService from '../services/RoleService';
import cache from '../cache';

dotenv.config();

const { User } = models;

class StartUpHelper {
  static async ensureSuperAdminExists() {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const slackId = process.env.SUPER_ADMIN_SLACK_ID;
    const userName = StartUpHelper.getUserNameFromEmail(email);

    try {
      const [user] = await User.findOrCreate({
        where: {
          email
        },
        defaults: {
          slackId,
          name: userName
        }
      });
      const [role] = await RoleService.createOrFindRole('Super Admin');
      await user.addRoles(role);
      return;
    } catch (error) {
      bugsnagHelper.log(error);
    }
  }

  static async flushStaleCache() {
    cache.flush();
  }

  static getUserNameFromEmail(email) {
    let firstName;

    [firstName] = email.split('@');
    const getIndex = firstName.indexOf('.');
    if (getIndex === -1) {
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    const fullName = email.split('@')[0].split('.');
    [firstName] = fullName;
    const firstNameCapitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const lastName = fullName[fullName.length - 1];
    const lastNameCapitalized = lastName.charAt(0).toUpperCase() + lastName.slice(1);
    return (`${firstNameCapitalized} ${lastNameCapitalized}`);
  }
}

export default StartUpHelper;
