import UserValidator from './UserValidator';
import DepartmentValidator from './DepartmentValidator';
import AddressValidator from './AddressValidator';
import GeneralValidator from './GeneralValidator';
import TokenValidator from './TokenValidator';
import RouteValidator from './RouteValidator';

const middleware = {
  UserValidator,
  DepartmentValidator,
  AddressValidator,
  GeneralValidator,
  TokenValidator,
  RouteValidator
};

export default middleware;
