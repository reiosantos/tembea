import { Op } from 'sequelize';
import database from '../database';
import RemoveDataValues from '../helpers/removeDataValues';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import UserService from './UserService';
import AddressService from './AddressService';

const { models: { Homebase, Country } } = database;

class HomebaseService {
  static async createHomebase({
    name, channel, address, countryId
  }) {
    const newHomebaseName = this.formatName(name);
    const homebaseAddress = await AddressService.findOrCreateAddress(address.address,
      address.location);
    if (homebaseAddress.longitude == null || homebaseAddress.latitude == null) {
      throw new Error('please provide address location');
    }

    const [homebase] = await Homebase.findOrCreate({
      where: { name: { [Op.iLike]: `${newHomebaseName.trim()}%` } },
      defaults: {
        name: newHomebaseName.trim(),
        countryId,
        channel,
        addressId: homebaseAddress.id,
      }
    });
    const { _options: { isNewRecord } } = homebase;
    return {
      homebase: RemoveDataValues.removeDataValues(homebase),
      isNewHomebase: isNewRecord
    };
  }

  static formatName(homebaseName) {
    const lowercasedName = homebaseName.toLowerCase();
    return lowercasedName.charAt(0).toUpperCase() + lowercasedName.slice(1);
  }


  static getWhereClause(filterParams) {
    let where = {};
    const { country, name } = filterParams;
    if (country) where = { country: this.formatName(country) };
    if (name) where = { ...where, name: this.formatName(name) };
    return where;
  }

  static async getHomebases(pageable, where) {
    const { page, size } = pageable;
    const filter = this.createFilter(where);
    const paginatedHomebases = new SequelizePaginationHelper(
      Homebase,
      filter,
      size
    );
    const { data, pageMeta } = await paginatedHomebases.getPageItems(page);
    const homebases = data.map((homebase) => HomebaseService.serializeHomebases(homebase));
    return { homebases, ...pageMeta };
  }

  static createFilter(where) {
    const { country: name } = where;
    let include = ['country'];
    if (name && include.indexOf('country') > -1) {
      const country = {
        model: Country,
        as: 'country',
        where: { name }
      };
      include = [country];
    }
    /* eslint no-param-reassign: ["error", { "props": false }] */
    delete where.country;
    return {
      where,
      include
    };
  }

  static serializeHomebases(homebase) {
    const { country, ...homebaseInfo } = homebase;
    const {
      id, name: homebaseName, channel, addressId, createdAt, updatedAt
    } = homebaseInfo;
    return {
      id,
      homebaseName,
      channel,
      country: HomebaseService.serializeCountry(country),
      addressId,
      createdAt,
      updatedAt
    };
  }

  static serializeCountry(country) {
    if (country) {
      return country.name;
    }
  }

  static async getAllHomebases(withForeignKey = false) {
    const homeBases = await Homebase.findAll({
      order: [['name', 'ASC']],
      attributes: { include: ['id', 'name', 'channel', 'addressId'] },
      include: withForeignKey ? [{ model: Country, as: 'country', attributes: ['name'] }] : []
    });
    return RemoveDataValues.removeDataValues(homeBases);
  }

  static async getHomeBaseBySlackId(slackId, withForeignKey = false) {
    const { homebaseId } = await UserService.getUserBySlackId(slackId);
    const homeBase = await Homebase.findOne({
      where: { id: homebaseId },
      attributes: ['id', 'name', 'channel', 'addressId'],
      include: withForeignKey ? [{ model: Country, as: 'country', attributes: ['name'] }] : []


    });
    return RemoveDataValues.removeDataValues(homeBase);
  }

  static async getById(homebaseId) {
    const homeBase = await Homebase.findOne({
      where: { id: homebaseId }
    });
    return homeBase;
  }

  static async update(name, id, channel, countryId, address) {
    const homebaseAddress = await AddressService.findOrCreateAddress(address.address, address.location);
    if (homebaseAddress.longitude == null || homebaseAddress.latitude == null) {
      throw new Error('please provide address location');
    }
    try {
      const [, [homeBase]] = await Homebase.update(
        {
          name, channel, countryId, address
        },
        { returning: true, where: { id } }
      );
      return RemoveDataValues.removeDataValues(homeBase);
    } catch (err) {
      return (err);
    }
  }
}
export default HomebaseService;
