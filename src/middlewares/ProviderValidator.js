import GeneralValidator from './GeneralValidator';
import UserService from '../services/UserService';

class ProviderValidator {
  /**
   * @description validate provider update body middleware
   * @returns errors or calls next
   * @example ProviderService.updateProvider(req,res,next);
   * @param req
   * @param res
   * @param next
   */
  static async verifyProviderUpdateBody(req, res, next) {
    const { body, params: { id } } = req;
    await GeneralValidator.validateUpdateBody(id, body, res, ['name', 'email'], 2, next);
  }

  static async createUpdateBody(body) {
    const { email, name } = body;
    const updateData = {};
    if (email) {
      const user = await UserService.getUserByEmail(email);
      if (!user) return { message: 'User with email doesnt exist' };
      updateData.providerUserId = user.dataValues.id;
    }
    if (name) updateData.name = name;
    return updateData;
  }
}

export default ProviderValidator;
