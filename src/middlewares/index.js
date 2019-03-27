import UserValidator from './UserValidator';
import DepartmentValidator from './DepartmentValidator';
import AddressValidator from './AddressValidator';
import GeneralValidator from './GeneralValidator';
import TokenValidator from './TokenValidator';
import RouteValidator from './RouteValidator';
import RouteRequestValidator from './RouteRequestValidator';
import TripValidator from './TripValidator';
import CabsValidator from './CabsValidator';
import CleanRequestBody from './CleanRequestBody';
import CountryValidator from './CountryValidator';

const middleware = {
  UserValidator,
  DepartmentValidator,
  AddressValidator,
  GeneralValidator,
  TokenValidator,
  RouteValidator,
  RouteRequestValidator,
  TripValidator,
  CabsValidator,
  CleanRequestBody,
  CountryValidator
};

export default middleware;
