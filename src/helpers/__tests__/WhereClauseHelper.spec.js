import { Op } from 'sequelize';
import WhereClauseHelper from '../WhereClauseHelper';

describe('WhereClauseHelper', () => {
  describe('populateWhereClause', () => {
    it('should return a populated where clause', () => {
      const initialWhere = {};
      const newWhereClause = WhereClauseHelper.populateWhereClause(true, initialWhere,
        {
          email: 'testuser@email.com'
        });
      expect(newWhereClause).toEqual({
        email: 'testuser@email.com'
      });
    });

    it('should return the initial where clause if criteria is false', () => {
      const initialWhere = {};
      const newWhereClause = WhereClauseHelper.populateWhereClause(false, initialWhere,
        {
          email: 'testuser@email.com'
        });
      expect(newWhereClause).toEqual({});
    });
  });
});

describe('TripHelper for noCab', () => {
  beforeEach(() => {
    jest.mock('sequelize', () => {
      jest.fn(() => ({
        Op: {
          [Symbol('and')]: 'and',
          [Symbol('eq')]: 'eq',
          [Symbol('ne')]: 'eq',
        }
      }));
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('should return a new where clause', () => {
    const initialWhereClause = {};
    expect(WhereClauseHelper.getNoCabWhereClause(true, initialWhereClause)).toEqual({
      [Op.and]: [{
        cabId: {
          [Op.eq]: null
        }
      },
      {
        confirmedById: {
          [Op.ne]: null
        }
      }
      ]
    });
  });

  it('should return the original where clause if noCab is false', () => {
    const initialWhereClause = {};
    expect(WhereClauseHelper.getNoCabWhereClause(false, initialWhereClause)).toEqual({});
  });
});
