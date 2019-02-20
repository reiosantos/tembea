import express from 'express';
import AddressController from './AddressController';
import middlewares from '../../middlewares';

const { GeneralValidator, AddressValidator, TokenValidator } = middlewares;
const addressRouter = express.Router();

addressRouter.use(
  '/addresses',
  TokenValidator.attachJwtSecretKey,
  TokenValidator.authenticateToken
);

addressRouter.post(
  '/addresses',
  AddressValidator.validateAddressBody,
  AddressValidator.validateAddressInfo,
  AddressValidator.validateaddress,
  AddressValidator.validateLocation,
  AddressController.addNewAddress
);

addressRouter.put(
  '/addresses',
  AddressValidator.validateAddressUpdateBody,
  AddressValidator.validateAddressInfo,
  AddressValidator.validateUpdateaddress,
  AddressValidator.validateLocation,
  AddressController.updateAddress
);

addressRouter.get(
  '/addresses',
  GeneralValidator.validateQueryParams,
  AddressController.getAddresses
);

export default addressRouter;
