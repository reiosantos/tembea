import UserValidator from './UserValidator';
import DepartmentValidator from './DepartmentValidator';
import AddressValidator from './AddressValidator';
import GeneralValidator from './GeneralValidator';

const middleware = {
  UserValidator,
  DepartmentValidator,
  AddressValidator,
  GeneralValidator
};

export default middleware;
