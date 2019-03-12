import SequelizePaginationHelper from '../sequelizePaginationHelper';
import tripRequestMock from '../__mocks__/tripRequestMock';
import HttpError from '../errorHandler';

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
      const { data: pageItems } = await sequelizeResult.getPageItems();
      expect(pageItems).not.toBeFalsy();
    });
  });

  describe('SequelizePaginationHelper_getPageNo', () => {
    let mockModel;
    let sequelizeResult;
    const mockFilter = { where: { test: 'dummy where' } };
    beforeEach(() => {
      mockModel = {
        count: jest.fn(),
        findAll: jest.fn(),
      };
      sequelizeResult = new SequelizePaginationHelper(mockModel, mockFilter);
    });
    it('should have a specific behaviour', async () => {
      mockModel.count.mockResolvedValue(54);
      let pageItems = await sequelizeResult.getPageNo(0);
      expect(mockModel.count).toHaveBeenCalledWith(mockFilter);
      expect(pageItems).toEqual(1);

      pageItems = await sequelizeResult.getPageNo(2);
      expect(pageItems).toEqual(2);

      pageItems = await sequelizeResult.getPageNo(6);
      expect(pageItems).toEqual(6);

      pageItems = await sequelizeResult.getPageNo(7);
      expect(pageItems).toEqual(6);
    });
  });

  describe('deserializeSort', () => {
    describe('validate invalid sortParam', () => {
      it('should returns undefined when an empty string is passed'
        + ' in as an argument', () => {
        const result = SequelizePaginationHelper.deserializeSort('');
        expect(result).toBeUndefined();
      });
      it('should throw error when invalid param is provided ', () => {
        const assertError = (param) => {
          try {
            SequelizePaginationHelper.deserializeSort(param);
          } catch (error) {
            expect(error)
              .toBeInstanceOf(HttpError);
            expect(error.message)
              .toEqual(SequelizePaginationHelper.sortErrorMessage);
            expect(error.statusCode)
              .toEqual(400);
          }
        };
        assertError('desc');
        assertError('asc');
        assertError('asc,desc');
        assertError('asc,name,id,');
      });
    });
    describe('valid sort param', () => {
      it('should return deserialized sort array', () => {
        const assertResult = (data, predicate, direction) => {
          expect(data)
            .toHaveProperty('predicate');
          expect(data)
            .toHaveProperty('direction');
          expect(data).toEqual({ predicate, direction });
        };
        let result = SequelizePaginationHelper.deserializeSort('name');
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toEqual(1);
        assertResult(result[0], 'name', 'desc');

        result = SequelizePaginationHelper.deserializeSort('name,asc');
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toEqual(1);
        assertResult(result[0], 'name', 'asc');

        result = SequelizePaginationHelper.deserializeSort('id,desc,name,asc');
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toEqual(2);
        assertResult(result[0], 'id', 'desc');
        assertResult(result[1], 'name', 'asc');
      });
    });
  });

  describe('serializeObject', () => {
    it('should remove nested dataValues', () => {
      const testObject = {
        dataValues: {
          name: 'Mubarak',
          school: {
            dataValues: {
              name: 'University of Ilorin'
            }
          }
        }
      };

      const result = SequelizePaginationHelper.deserializeObject(testObject);

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('school');
      expect(result.school).toHaveProperty('name');
    });
  });
});
