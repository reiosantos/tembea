import models from '../database/models';
import HttpError from '../helpers/errorHandler';
import bugsnagHelper from '../helpers/bugsnagHelper';

import LocationService from './LocationService';

const { Address, Location } = models;

class AddressService {
  /**
   * @description Get the address by address from the database
   * @param  {string} address The address of the address on the db
   * @returns {object} The http response object
   */
  static async findAddress(address) {
    try {
      const place = await Address.findOne({
        where: {
          address: address.toLowerCase()
        },
        include: ['location']
      });
      return place;
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.throwErrorIfNull(null, 'Could not find address record', 404);
    }
  }

  /**
   * @description Saves the new address and location record
   * @param  {number} longitude The longitude of the location
   * @param  {number} latitude The latitude of the location
   * @param  {string} address The address of thr location
   * @returns {object} The newly created address and location info
   */
  static async createNewAddress(longitude, latitude, address) {
    try {
      const location = await LocationService.createLocation(longitude, latitude);
      const addressData = await Address.create({ locationId: location.id, address: (address.toLowerCase()).trim() });
      const newAddressData = { ...addressData.dataValues, ...location };
      return newAddressData;
    } catch (error) {
      bugsnagHelper.log(error);
      HttpError.throwErrorIfNull(null, 'Could not create address', 500);
    }
  }

  /**
   * @description updates address and location record
   * @returns {string} The address to be updated
   * @param  {string} newAddress The new address
   * @param  {number} newLongitude The new longitude of the location
   * @param  {number} newLatitude The new latitude of the location
   * @returns {object} The newly created address and location info
   */
  static async updateAddress(address, newLongitude, newLatitude, newAddress) {
    try {
      const addressData = await AddressService.findAddress(address);
      const modAddress = addressData;

      modAddress.address = (newAddress || addressData.dataValues.address).trim();
      modAddress.location.longitude = newLongitude || modAddress.location.dataValues.longitude;
      modAddress.location.latitude = newLatitude || modAddress.location.dataValues.latitude;
      await modAddress.save();

      const updatedAddressData = { ...modAddress.dataValues, ...modAddress.location.dataValues };
      return updatedAddressData;
    } catch (error) {
      HttpError.throwErrorIfNull(
        null,
        'Could not update address record',
        500
      );
    }
  }

  /**
   * @description Get's paginated address records from db
   * @param  {number} size The size of a single page
   * @param  {number} page The page number
   * @returns {object} An array of addresses
   */
  static async getAddressesFromDB(size, page) {
    return Address.findAndCountAll({
      raw: true,
      limit: size,
      offset: size * (page - 1),
      order: [['id', 'DESC']],
      include: [{ model: Location, as: 'location' }]
    });
  }
}

export default AddressService;
