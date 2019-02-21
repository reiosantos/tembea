import UserValidator from './UserValidator';
import DepartmentValidator from './DepartmentValidator';
import AddressValidator from './AddressValidator';
import GeneralValidator from './GeneralValidator';
import TokenValidator from './TokenValidator';
import RouteValidator from './RouteValidator';
import RouteRequestValidator from './RouteRequestValidator';
import TripValidator from './TripValidator';

const middleware = {
  UserValidator,
  DepartmentValidator,
  AddressValidator,
  GeneralValidator,
  TokenValidator,
  RouteValidator,
  RouteRequestValidator,
  TripValidator
};

export default middleware;
