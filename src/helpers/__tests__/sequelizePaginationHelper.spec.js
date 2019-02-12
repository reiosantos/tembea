import SequelizePaginationHelper from '../sequelizePaginationHelper';
import tripRequestMock from '../__mocks__/tripRequestMock';


describe('SequelizePaginationHelper', () => {
  it('should be instance of SequelizePaginationHelper', () => {
    const sequelizeResult = new SequelizePaginationHelper(tripRequestMock, {});
    expect(sequelizeResult).toBeInstanceOf(SequelizePaginationHelper);
  });

  describe('SequelizePaginationHelper_getTotalPages', () => {
    it('should return totalpages if model is valid', async () => {
      const sequelizeResult = new SequelizePaginationHelper(tripRequestMock, {});
      const totalPage = await sequelizeResult.getTotalPages();
      expect(totalPage).toEqual(2);
    });
    it('should return totalpages if filters is not passed', async () => {
      const sequelizeResult = new SequelizePaginationHelper(tripRequestMock);
      const totalPage = await sequelizeResult.getTotalPages();
      expect(totalPage).toEqual(2);
    });
  });

  describe('SequelizePaginationHelper_getPageItems', () => {
    it('should have a specific behaviour', async () => {
      const sequelizeResult = new SequelizePaginationHelper(tripRequestMock, {});
      const pageItems = await sequelizeResult.getPageItems();
      expect(pageItems).not.toBeFalsy();
    });
  });

  describe('SequelizePaginationHelper_getPageNo', () => {
    it('should have a specific behaviour', async () => {
      const sequelizeResult = new SequelizePaginationHelper(tripRequestMock, {});
      const pageItems = await sequelizeResult.getPageNo(0);
      expect(pageItems).toEqual(1);
    });

    it('should have a specific behaviour', async () => {
      const sequelizeResult = new SequelizePaginationHelper(tripRequestMock, {});
      const totalPages = await sequelizeResult.getTotalPages();
      const pageItems = await sequelizeResult.getPageNo(totalPages + 1);
      expect(pageItems).toEqual(totalPages);
    });
  });
});
