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
});
