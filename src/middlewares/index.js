import UserValidator from './UserValidator';
import DepartmentValidator from './DepartmentValidator';
import GeneralValidator from './GeneralValidator';

const middleware = {
  UserValidator,
  DepartmentValidator,
  GeneralValidator
};

export default middleware;
