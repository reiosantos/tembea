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

/**
 * @swagger
 * /addresses:
 *  post:
 *    summary: adds a new address
 *    description: "Authentication required"
 *    tags:
 *      - Addresses
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - longitude
 *            - latitude
 *            - address
 *          properties:
 *            longitude:
 *              type: number
 *            latitude:
 *              type: number
 *            address:
 *              type: string
 *    responses:
 *      201:
 *        description: when the address was successfully created
 *        schema:
 *          type: object
 *      400:
 *        description: bad request
 *      401:
 *        description: when not authenticated
 */
addressRouter.post(
  '/addresses',
  AddressValidator.validateAddressBody,
  AddressValidator.validateAddressInfo,
  AddressValidator.validateaddress,
  AddressValidator.validateLocation,
  AddressController.addNewAddress
);

/**
 * @swagger
 * /addresses:
 *  put:
 *    summary: update an existing address
 *    tags:
 *      - Addresses
 *    parameters:
 *      - name: body
 *        in: body
 *        required: true
 *        type: string
 *        schema:
 *          type: object
 *          required:
 *            - address
 *          properties:
 *            newLongitude:
 *              type: number
 *            newLatitude:
 *              type: number
 *            address:
 *              type: string
 *            newAddress:
 *              type: string
 *    responses:
 *      200:
 *        description: when the address is successfully updated
 *      400:
 *        description: bad request
 */
addressRouter.put(
  '/addresses',
  AddressValidator.validateAddressUpdateBody,
  AddressValidator.validateAddressInfo,
  AddressValidator.validateUpdateaddress,
  AddressValidator.validateLocation,
  AddressController.updateAddress
);

/**
 * @swagger
 * /addresses:
 *  get:
 *    summary: get all addresses on the database
 *    description: supports pagination
 *    tags:
 *      - Addresses
 *    parameters:
 *      - name: page
 *        in: query
 *        required: false
 *        description: page number
 *        type: number
 *      - name: size
 *        in: query
 *        required: false
 *        description: number of items per page
 *        type: number
 *    responses:
 *      200:
 *        description: response object contains all addresses on the db
 *      400:
 *        description: bad request
 */
addressRouter.get(
  '/addresses',
  GeneralValidator.validateQueryParams,
  AddressController.getAddresses
);

export default addressRouter;
