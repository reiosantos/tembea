import UserValidator from './UserValidator';
import DepartmentValidator from './DepartmentValidator';
import AddressValidator from './AddressValidator';
import GeneralValidator from './GeneralValidator';
import TokenValidator from './TokenValidator';

const middleware = {
  UserValidator,
  DepartmentValidator,
  AddressValidator,
  GeneralValidator,
  TokenValidator
};

export default middleware;
