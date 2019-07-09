import DepartmentService from '../DepartmentService';
import model from '../../database/models';
import UserService from '../UserService';
import { departmentMocks } from '../__mocks__';
import cache from '../../cache';


const { Department, TripRequest } = model;

describe('/DepartmentService', () => {
  describe('Departments update', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    it('should run the getHeadId catchBlock on error', async () => {
      try {
        UserService.getUser = jest.fn(() => 'notValid');
        await DepartmentService.getHeadId('noEmail');
      } catch (error) {
        expect(error.message).toBe('Error getting the head of department');
      }
    });
  
    it('should run the saveChanges catchBlock on error', async () => {
      try {
        Department.update = jest.fn(() => 'notValid');
        await DepartmentService.updateDepartment('Finance-demo', 'Finance-demo-1');
      } catch (error) {
        expect(error.message).toBe('Error updating department');
      }
    });
  
    it('should create a department', async () => {
      const dept = await Department.create({
        name: 'DSTD',
        headId: 1,
        teamId: '45THKULE',
        status: 'Inactive'
      });
  
      const recreated = await DepartmentService.createDepartment({ id: 1 }, 'DSTD');
      expect(recreated.length).toEqual(2);
  
      await dept.destroy();
    });
  
    it('should return a single instance of a department', async () => {
      jest.spyOn(Department, 'findByPk').mockResolvedValue(departmentMocks[0]);
      const dept = await DepartmentService.getById(1);
      expect(typeof dept).toEqual('object');
      expect(dept).toEqual({ name: 'Mathematics', id: 1, head: { id: 1 } });
      expect(Department.findByPk).toBeCalled();
    });
  });
  
  describe('getDepartments', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    beforeAll(() => {
      jest.spyOn(Department, 'findAll').mockResolvedValue(departmentMocks);
    });

    it('should return an array with department entries', async () => {
      const departments = await DepartmentService.getDepartmentsForSlack();
      expect(departments).toBeInstanceOf(Array);
      expect(departments).toHaveLength(departmentMocks.length);
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
      afterEach(() => {
        jest.clearAllMocks();
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
      expect(department.head).toBeDefined();
    });
  });
  describe('DepartmentService_getHeadByDeptId', () => {
    it('should show that this method returns the head data', async () => {
      jest.spyOn(DepartmentService, 'getById').mockResolvedValue(
        { name: 'Mathematics', id: 1, head: { id: 1 } }
      );
      const head = await DepartmentService.getHeadByDeptId(2);
      expect(head).toBeDefined();
    });
  });
  describe('DepartmentService_getDepartmentAnalytics', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    beforeAll(() => {
      jest.spyOn(Department, 'findAll').mockResolvedValue(departmentMocks);
    });
    it('should return an array with department analytics data', async () => {
      jest.spyOn(DepartmentService, 'mapDepartmentId').mockResolvedValue(['tdd', 'travel', 'Mathematics']);
      jest.spyOn(TripRequest, 'findAll').mockResolvedValue(departmentMocks);
      const departmentData = await
      DepartmentService.getDepartmentAnalytics(null, null, ['tdd', 'travel', 'Mathematics']);
      expect(departmentData).toBeInstanceOf(Array);
    });
    it('should return an empty array of department analytics data', async () => {
      jest.spyOn(DepartmentService, 'mapDepartmentId').mockResolvedValue([]);
      jest.spyOn(TripRequest, 'findAll').mockResolvedValue(departmentMocks);
      const departmentData = await DepartmentService.getDepartmentAnalytics();
      expect(departmentData).toHaveLength(1);
    });
  });

  describe('DepartmentService_mapDepartmentId', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
    });
    beforeEach(() => {
      jest.spyOn(Department, 'findAll').mockResolvedValue(departmentMocks);
    });
    it('should map departmentId to department names', async () => {
      const departmentIds = await DepartmentService.mapDepartmentId(
        ['people', 'tdd', 'travel', 'Mathematics']
      );
      expect(departmentIds[0]).toEqual(departmentMocks[0].id);
    });
    it('should not map departmentId to department names', async () => {
      const departmentIds = await DepartmentService.mapDepartmentId();
      expect(departmentIds.length).toBe(0);
    });
  });
});
