/* eslint-disable guard-for-in */
import HttpError from './errorHandler';

export default class SequelizePaginationHelper {
  constructor(collection, filter, itemsPerPage = 10) {
    this.items = collection;
    this.filter = filter;
    this.itemsPerPage = Number(itemsPerPage);
  }

  static isDirectionValid(direction) {
    return ['asc', 'desc'].includes(direction);
  }

  static parseSortParam(items) {
    if (!(items.includes('desc') || items.includes('asc'))) {
      HttpError.throwErrorIfNull(null, SequelizePaginationHelper.sortErrorMessage, 400);
    }
    const isDirectionValid = SequelizePaginationHelper.isDirectionValid(items[0]);
    return {
      direction: (isDirectionValid) ? items[0] : items[1],
      predicate: (!isDirectionValid) ? items[0] : items[1],
    };
  }

  static deserializeSort(sortParam) {
    if (!sortParam) return;
    const sort = sortParam.split(',');
    const len = sort.length;
    if (len === 1 && !SequelizePaginationHelper.isDirectionValid(sortParam)) {
      return [{ predicate: sortParam, direction: 'desc' }];
    }
    if (len % 2 !== 0) {
      HttpError.throwErrorIfNull(null, SequelizePaginationHelper.sortErrorMessage, 400);
    }
    const deserialize = [];
    while (sort.length) {
      const items = sort.splice(0, 2);
      const data = SequelizePaginationHelper.parseSortParam(items);
      deserialize.push(data);
    }
    return deserialize;
  }

  async getTotalPages() {
    if (!this.totalItems) {
      this.totalItems = this.filter
        ? await this.items.count(this.filter)
        : await this.items.count();
    }
    const total = Math.ceil(this.totalItems / this.itemsPerPage);
    return total || 1;
  }

  async getPageInfo(page = 1) {
    const totalPages = await this.getTotalPages();
    const pageNo = await this.getPageNo(page);
    const { totalItems, itemsPerPage } = this;
    return {
      totalPages, pageNo, totalItems, itemsPerPage
    };
  }

  async getPageNo(pageNo = 1) {
    const totalPages = await this.getTotalPages();
    const pageNumber = Number(pageNo) || 1;
    return Math.min(pageNumber, totalPages);
  }

  /**
   * @param {number} [pageNo=1]
   * @returns {{data: Array<Object>, pageMeta: { totalPages: Number, pageNo: Number, totalItems: Number, itemsPerPage: Number } }} tne result page items
   * @memberof SequelizePaginationHelper
   */
  async getPageItems(pageNo = 1, moreParams = {}) {
    const $pageNo = await this.getPageNo(pageNo);
    const paginationConstraint = {
      offset: ($pageNo - 1) * this.itemsPerPage,
      limit: this.itemsPerPage
    };
    const filter = { ...this.filter, ...moreParams };
    const rawData = await this.items.findAll({ ...filter, ...paginationConstraint });
    const $pageMeta = await this.getPageInfo($pageNo);
    const data = rawData.map(SequelizePaginationHelper.deserializeObject);
    return {
      data,
      pageMeta: $pageMeta
    };
  }


  static deserializeObject(data) {
    const value = data ? (data.dataValues || data) : data;

    Object.keys(value).forEach((key) => {
      value[key] = value[key] ? (value[key].dataValues || value[key]) : value[key];
    });

    return value;
  }
}

SequelizePaginationHelper.sortErrorMessage = 'Invalid sort provided. '
    + 'It must be in the format: sort=<predicate>,<direction>, '
    + 'where direction must be either [asc, desc] e.g. sort=id,asc';
