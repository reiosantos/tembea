import { Op } from 'sequelize';

import models from '../database/models';
import UserService from './UserService';
import HttpError from '../helpers/errorHandler';
import SlackHelpers from '../helpers/slack/slackHelpers';


const { Department, User } = models;

class DepartmentService {
  static async createDepartment(user, name) {
    const department = await Department.findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` } },
      defaults: {
        name,
        headId: user.id
      }
    });
    return department;
  }

  static async getHeadId(email) {
    try {
      const headOfDepartment = await UserService.getUser(email);
      return headOfDepartment.dataValues.id;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      HttpError.throwErrorIfNull(null, 'Error getting the head of department', 500);
    }
  }

  static async updateDepartment(name, newName, newHeadEmail) {
    let headId;
    try {
      if (newHeadEmail) {
        headId = await DepartmentService.getHeadId((newHeadEmail).trim());
      }

      const department = await Department.update(
        { name: newName, headId },
        { returning: true, where: { name: { [Op.iLike]: `${name}%` } } }
      );

      HttpError.throwErrorIfNull(department[1].length,
        'Department not found. To add a new department use POST /api/v1/departments');

      const updatedDepartment = department[1][0].dataValues;
      const head = await SlackHelpers.getHeadByDepartmentId(updatedDepartment.id);

      const newDepartmentRecords = {
        name: updatedDepartment.name,
        head: { name: head.name, email: head.email }
      };

      return newDepartmentRecords;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      HttpError.throwErrorIfNull(null, 'Error updating department', 500);
    }
  }


  /**
   * @description returns paginated departments records
   * @param {number} size The size of a single paginated
   * @param {number} page The page number
   * @returns {object} an array of departments
   */
  static async getAllDepartments(size, page) {
    return Department.findAndCountAll({
      raw: true,
      limit: size,
      include: [
        { model: User, as: 'head' }
      ],
      offset: (size * (page - 1)),
      order: [['id', 'DESC']]
    });
  }
}

export default DepartmentService;
