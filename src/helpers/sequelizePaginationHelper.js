export default class SequelizePaginationHelper {
  constructor(collection, filter, itemsPerPage = 10) {
    this.items = collection;
    this.filter = filter;
    this.itemsPerPage = Number(itemsPerPage);
  }
  
  async getTotalPages() {
    if (!this.totalItems) {
      this.totalItems = this.filter
        ? await this.items.count(this.filter)
        : await this.items.count();
    }
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  async getPageNo(pageNo = 1) {
    const pageNumber = Number(pageNo);
    const totalPages = await this.getTotalPages();
    if (pageNumber !== 1 && pageNumber > totalPages) {
      return totalPages;
    }

    if (pageNumber < 1) {
      return 1;
    }

    return pageNumber;
  }


  async getPageItems(pageNo = 1) {
    const paginationConstraint = {
      offset: (pageNo - 1) * this.itemsPerPage,
      limit: this.itemsPerPage
    };
    return this.items.findAll({ ...this.filter, ...paginationConstraint });
  }
}
