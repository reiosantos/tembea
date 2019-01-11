import express from 'express';
import AddressController from './AddressController';
import middlewares from '../../middlewares';

const { GeneralValidator, AddressValidator } = middlewares;
const addressRouter = express.Router();

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
