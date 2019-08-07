import { Op } from 'sequelize';
import models from '../database/models';
import RemoveDataValues from '../helpers/removeDataValues';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import UserService from './UserService';

const { Homebase, Country } = models;

class HomebaseService {
  static async createHomebase(homebaseName, countryId) {
    const newHomebaseName = this.formatName(homebaseName);
    const [homebase] = await Homebase.findOrCreate({
      where: { name: { [Op.iLike]: `${newHomebaseName.trim()}%` } },
      defaults: {
        name: newHomebaseName.trim(),
        countryId,
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
    const homebases = data.map(homebase => HomebaseService.serializeHomebases(homebase));
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
      id, name: homebaseName, createdAt, updatedAt
    } = homebaseInfo;
    return {
      id,
      homebaseName,
      country: HomebaseService.serializeCountry(country),
      createdAt,
      updatedAt
    };
  }

  static serializeCountry(country) {
    if (country) {
      return country.name;
    }
  }

  static async getHomeBaseBySlackId(slackId) {
    const { homebaseId } = await UserService.getUserBySlackId(slackId);
    const homeBase = await Homebase.findAll({
      where: { id: homebaseId },
      attributes: ['id', 'name']
    });
    return RemoveDataValues.removeDataValues(homeBase);
  }
}
export default HomebaseService;
