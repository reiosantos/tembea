import { Op } from 'sequelize';

export default class WhereClauseHelper {
  /**
   * @description This is a proposed method that can be used for
   * generic conditional population of the where clause object
   * @method populateWhereClause
   * @param {object} criteria the condition to test against
   * @param {object} where initial where clause
   * @param {object} newValues the object to add to the new where clause
   * @returns {object} Returns a new `where` clause object if `criteria`
   * evaluates to true, or the original `where` clause object if otherwise
   */
  static populateWhereClause(criteria, where, newValues) {
    if (criteria) {
      return {
        ...where,
        ...newValues
      };
    }
    return where;
  }

  /**
 * @description Derives new where clause object based on the
 * value of `noCab`
 * @method getNoCabWhere
 * @param {boolean} noCab
 * @param {object} where initial where clause object
 * @returns {object} Returns a new `where` clause object if `noCab`
 * evaluates to true, or the original `where` clause object if otherwise
 */
  static getNoCabWhereClause(noCab, where) {
    if (noCab) {
      return {
        ...where,
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
      };
    }
    return where;
  }
}
