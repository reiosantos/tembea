import { Op } from 'sequelize';

import models from '../database/models';
import UsersController from '../modules/users/UsersController';
import HttpError from '../helpers/errorHandler';
import SlackHelpers from '../helpers/slack/slackHelpers';


const { Department } = models;

class DepartmentService {
  static async getHeadId(email) {
    try {
      const headOfDepartment = await UsersController.getUser(email);
      return headOfDepartment.dataValues.id;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      HttpError.throwErrorIfNull(null, 'Error getting the head of department');
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
      HttpError.throwErrorIfNull(null, 'Error updating department');
    }
  }
}

export default DepartmentService;
