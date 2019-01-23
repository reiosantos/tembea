import DepartmentService from '../DepartmentService';
import model from '../../database/models';
import UserService from '../UserService';

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
    const dept = await DepartmentService.getDepartment(1);
    expect(typeof dept).toEqual('object');
    expect(dept).toEqual({});
    expect(Department.findByPk).toBeCalled();
    done();
  });
});
