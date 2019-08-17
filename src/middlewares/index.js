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
import HomebaseValidator from './HomebaseValidator';
import ProviderValidator from './ProviderValidator';
import DriversValidator from './DriversValidator';
import HomebaseFilterValidator from './HomeBaseFilterValidator';

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
  DriversValidator,
  CountryValidator,
  HomebaseValidator,
  ProviderValidator,
  HomebaseFilterValidator
};

export default middleware;
