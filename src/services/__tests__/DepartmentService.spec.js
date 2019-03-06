import DepartmentService from '../DepartmentService';
import model from '../../database/models';
import UserService from '../UserService';
import { departmentMocks } from '../__mocks__';
import cache from '../../cache';

const { Department } = model;

describe('/Departments update', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should run the getHeadId catchBlock on error', async (done) => {
    try {
      UserService.getUser = jest.fn(() => 'notValid');
      await DepartmentService.getHeadId('noEmail');
    } catch (error) {
      expect(error.message).toBe('Error getting the head of department');
    }
    done();
  });

  it('should run the saveChanges catchBlock on error', async (done) => {
    try {
      Department.update = jest.fn(() => 'notValid');
      await DepartmentService.updateDepartment('Finance-demo', 'Finance-demo-1');
    } catch (error) {
      expect(error.message).toBe('Error updating department');
    }
    done();
  });

  it('should create a department', async (done) => {
    const dept = await Department.create({
      name: 'DSTD',
      headId: 1,
      teamId: '45THKULE',
      status: 'Inactive'
    });

    const recreated = await DepartmentService.createDepartment({ id: 1 }, 'DSTD');
    expect(recreated.length).toEqual(2);

    await dept.destroy();
    done();
  });

  it('should return a single instance of a department', async (done) => {
    Department.findByPk = jest.fn(() => Promise.resolve({}));
    const dept = await DepartmentService.getById(1);
    expect(typeof dept).toEqual('object');
    expect(dept).toEqual({});
    expect(Department.findByPk).toBeCalled();
    done();
  });
  describe('getDepartments', () => {
    beforeAll(() => {
      jest.spyOn(Department, 'findAll').mockResolvedValue(departmentMocks);
    });

    it('should return an array with department entries', async (done) => {
      const departments = await DepartmentService.getDepartmentsForSlack();

      expect(departments).toBeInstanceOf(Array);
      expect(departments).toHaveLength(departmentMocks.length);
      expect(departments[0].head).toBeDefined();
      done();
    });
  });
  describe('DepartmentService_getById', () => {
    beforeAll(() => {
      cache.saveObject = jest.fn(() => { });
      cache.fetch = jest.fn((id) => {
        if (id === 'dept_2') {
          return { dept: departmentMocks };
        }
      });
    });
    it('should throw an error when given non-integer as departmentId', async () => {
      try {
        await DepartmentService.getById('x');
      } catch (error) {
        expect(error.message).toEqual(
          'The parameter provided is not valid. It must be a valid number'
        );
      }
    });
    it('should test that database queries are cached', async () => {
      const department = await DepartmentService.getById(2);
      expect(department).toEqual({ dept: departmentMocks });
    });
    it('should return a single department', async () => {
      jest.spyOn(Department, 'findByPk').mockResolvedValue(departmentMocks[0]);
      const department = await DepartmentService.getById(1);
      expect(department).toBeDefined();
      expect(department.dataValues.head).toBeDefined();
    });
  });
  describe('DepartmentService_getHeadByDeptId', () => {
    it('should show that this method returns the head data', async () => {
      jest.spyOn(DepartmentService, 'getById').mockResolvedValue(departmentMocks[0]);
      const head = await DepartmentService.getHeadByDeptId(1);
      expect(head).toBeDefined();
      expect(head).toEqual({});
    });
  });
});
