import { Op } from 'sequelize';

import models from '../database/models';
import UserService from './UserService';
import HttpError from '../helpers/errorHandler';
import cache from '../cache';
import RemoveDataValues from '../helpers/removeDataValues';


const { Department, User } = models;
const getDeptKey = id => `dept_${id}`;

class DepartmentService {
  static async createDepartment(user, name, teamId, location) {
    const department = await Department.scope('all').findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` } },
      defaults: {
        name,
        headId: user.id,
        teamId,
        location
      }
    });
    

    if (department[0] && department[0].dataValues.status === 'Inactive') {
      department[0].headId = user.id;
      department[0].status = 'Active';
      department[0].save();
      department[1] = true;
    }

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

  static async updateDepartment(name, newName, newHeadEmail, location) {
    let headId;
    try {
      if (newHeadEmail) {
        headId = await DepartmentService.getHeadId((newHeadEmail).trim());
      }

      const department = await Department.update(
        { name: newName, headId, location },
        { returning: true, where: { name: { [Op.iLike]: `${name}%` } } }
      );

      HttpError.throwErrorIfNull(department[1].length,
        'Department not found. To add a new department use POST /api/v1/departments');

      const updatedDepartment = department[1][0].dataValues;
      const head = await DepartmentService.getHeadByDeptId(updatedDepartment.id);
      const newDepartmentRecords = {
        name: updatedDepartment.name,
        head: { name: head.name, email: head.email },
        location: updatedDepartment.location
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

  /**
   * @description This method deletes a department
   * @param {number} id The id of the department
   * @param {string} name The name of the department
   * @returns {boolean} The status of the delete operation
   */
  static async deleteDepartmentByNameOrId(id = -1, name = '') {
    const department = await Department.findOne({
      where: {
        [Op.or]: [
          { id },
          { name: name.trim() }
        ]
      }
    });

    HttpError.throwErrorIfNull(department, 'Department not found', 404);

    department.status = 'Inactive';
    department.save();
    return true;
  }

  static async getById(departmentId, includeOptions = ['head']) {
    if (Number.isNaN(parseInt(departmentId, 10))) {
      throw Error('The parameter provided is not valid. It must be a valid number');
    }
    const cachedDept = await cache.fetch(getDeptKey(departmentId));
    if (cachedDept) {
      return cachedDept;
    }
    const department = await Department.findByPk(departmentId, { include: [...includeOptions] });
    const dept = RemoveDataValues.removeDataValues(department);

    await cache.saveObject(getDeptKey(departmentId), dept);
    return dept;
  }

  static async getHeadByDeptId(departmentId) {
    const department = await DepartmentService.getById(departmentId);
    const { head } = department;
    return head;
  }

  static async getDepartmentsForSlack(teamId) {
    const departments = teamId ? await Department.findAll({
      where: { teamId },
      include: ['head']
    }) : await Department.findAll({
      include: ['head']
    });
    return departments.map(item => ({
      label: item.dataValues.name,
      value: item.dataValues.id,
      head: item.dataValues.head ? item.dataValues.head.dataValues : item.dataValues.head
    }));
  }
}

export default DepartmentService;
