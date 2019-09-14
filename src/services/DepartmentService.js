import { Op } from 'sequelize';

import models from '../database/models';
import UserService from './UserService';
import HttpError from '../helpers/errorHandler';
import cache from '../cache';
import RemoveDataValues from '../helpers/removeDataValues';


const {
  Department, User, TripRequest, Country
} = models;
const getDeptKey = id => `dept_${id}`;
const userInclude = {
  model: User,
  as: 'head',
  required: true,
  attributes: ['name', 'email'],
  where: { }
};
export const departmentDataAttributes = {
  attributes: [
    'departmentId',
    [models.sequelize.literal('department.name'), 'departmentName'],
    [models.sequelize.fn('avg', models.sequelize.col('rating')), 'averageRating'],
    [models.sequelize.fn('count', models.sequelize.col('departmentId')), 'totalTrips'],
    [models.sequelize.fn('sum', models.sequelize.col('cost')), 'totalCost'],
  ],
  group: ['department.id', 'TripRequest.departmentId'],
};

class DepartmentService {
  static async createDepartment(user, name, teamId, homebaseId) {
    const department = await Department.scope('all').findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` }, homebaseId },
      defaults: {
        name,
        headId: user.id,
        teamId,
        homebaseId
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

  static async updateDepartment(id, name, headId) {
    try {
      const department = await Department.update(
        {
          name, headId
        }, { returning: true, where: { id } }
      );
      HttpError.throwErrorIfNull(department[1].length,
        'Department not found. To add a new department use POST /api/v1/departments');
      const [, [{ id: departmentId, headId: dbHeadId }]] = department;
      userInclude.where.id = dbHeadId;
      const newDepartmentRecords = await Department.findOne({
        where: { id: departmentId },
        include: [userInclude],
        attributes: ['id', 'name']
      });
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
  static async getAllDepartments(size, page, homebaseId) {
    return Department.findAndCountAll({
      raw: true,
      limit: size,
      where: { homebaseId },
      include: [
        { model: User, as: 'head' },
        {
          model: models.Homebase,
          as: 'homebase',
          attributes: ['id', 'name'],
          include: [{ model: Country, as: 'country', attributes: ['name', 'id', 'status'] }]
        }
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

  static async getDepartmentsForSlack(teamId, homebaseId) {
    const departments = teamId ? await Department.findAll({
      where: { teamId, homebaseId },
      include: ['head'],
    }) : await Department.findAll({
      include: ['head'],
      where: { homebaseId }
    });
    return departments.map(item => ({
      label: item.dataValues.name,
      value: item.dataValues.id,
      head: item.dataValues.head ? item.dataValues.head.dataValues : item.dataValues.head
    }));
  }

  static async mapDepartmentId(departments) {
    const departmentList = await Department.findAll();
    const dept = RemoveDataValues.removeDataValues(departmentList);
    const departmentIds = [];
    if (departments) {
      dept.forEach((department) => {
        departments.forEach((departmentName) => {
          if (department.name.toLowerCase()
          === departmentName.toLowerCase()) { departmentIds.push(department.id); }
        });
      });
    }

    return departmentIds;
  }

  static async getDepartmentAnalytics(startDate, endDate, departments, tripType, homebaseId) {
    const departmentId = await DepartmentService.mapDepartmentId(departments);
    let where = {};
    if (departmentId.length) { where = { id: { [Op.in]: departmentId } }; }
    const tripFilter = {
      tripStatus: 'Completed', createdAt: { [Op.between]: [startDate, endDate] }, homebaseId
    };
    if (tripType) { tripFilter.tripType = tripType; }
    const result = await TripRequest.findAll({
      where: { ...tripFilter, homebaseId },
      include: [{
        model: Department, as: 'department', attributes: [], where
      }],
      ...departmentDataAttributes
    });
    return RemoveDataValues.removeDataValues(result);
  }
}

export default DepartmentService;
