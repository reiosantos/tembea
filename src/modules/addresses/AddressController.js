import HttpError from '../../helpers/errorHandler';
import bugsnagHelper from '../../helpers/bugsnagHelper';
import AddressService from '../../services/AddressService';
import { DEFAULT_SIZE as defaultSize } from '../../helpers/constants';
import Response from '../../helpers/responseHelper';

class AddressController {
  /**
   * @description creates a new location and address record
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async addNewAddress(req, res) {
    try {
      const { longitude, latitude, address } = req.body;
      const newLongitude = Number(longitude);
      const newLatitude = Number(latitude);

      const newAddress = await AddressService.createNewAddress(newLongitude, newLatitude, address);
      const message = 'Address has been successfully created';
      const addressData = {
        address: {
          address: newAddress.address,
          longitude: newAddress.longitude,
          latitude: newAddress.latitude
        }
      };
      return Response.sendResponse(res, 201, true, message, addressData);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Updates the address and location record
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async updateAddress(req, res) {
    try {
      const {
        newLongitude, newLatitude, newAddress, address
      } = req.body;
      const longitude = Number(newLongitude);
      const latitude = Number(newLatitude);

      const addressData = await AddressService.updateAddress(
        address,
        longitude,
        latitude,
        newAddress
      );

      const data = {
        address: {
          address: addressData.address,
          longitude: addressData.longitude,
          latitude: addressData.latitude
        }
      };
      const message = 'Address record updated';
      return Response.sendResponse(res, 200, true, message, data);
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.sendErrorResponse(error, res);
    }
  }

  /**
   * @description Read the address records
   * @param  {object} req The http request object
   * @param  {object} res The http response object
   * @returns {object} The http response object
   */
  static async getAddresses(req, res) {
    try {
      const page = req.query.page || 1;
      const size = req.query.size || defaultSize;

      const data = await AddressService.getAddressesFromDB(size, page);
      const { count, rows } = data;
      if (rows <= 0) {
        throw new HttpError('There are no records on this page.', 404);
      }

      const totalPages = Math.ceil(count / size);
      const message = `${page} of ${totalPages} page(s).`;

      const pageData = {
        pageMeta: {
          totalPages,
          totalResults: count,
          page
        }
      };
      const addressData = { pageData, data };
      return Response.sendResponse(res, 200, true, message, addressData);
    } catch (error) {
      HttpError.sendErrorResponse(error, res);
    }
  }
}

export default AddressController;
