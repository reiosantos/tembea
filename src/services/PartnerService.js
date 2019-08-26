import { Op } from 'sequelize';
import database from '../database';

const { models: { Partner, Engagement } } = database;

class PartnerService {
  /**
   *
   * @param name
   * @return {Promise<Promise<Array<Instance, Boolean>>|Promise<Model, created>|*>}
   * @throws {Error}
   */
  static async findOrCreatePartner(name) {
    const [partner] = await Partner.findOrCreate({
      where: { name: { [Op.iLike]: `${name}%` } },
      defaults: { name }
    });
    return partner;
  }

  /**
   *
   * @param {string} startDate Fellow's engagement start date
   * @param {string} endDate Fellow's engagement end date
   * @param {string} workHours Fellow's working hours format: startTime-endTime -> HH:MM-HH:MM
   * @param {User} fellow
   * @param {Partner} partner
   * @return {Promise<Engagement>}
   * @throws {Error}
   */
  static async findOrCreateEngagement(workHours, fellow, partner, startDate, endDate) {
    const { id: fellowId } = fellow;
    const { id: partnerId } = partner;
    const [engagement] = await Engagement.findOrCreate({
      where: { fellowId, partnerId },
      defaults: {
        startDate,
        endDate,
        workHours,
        fellowId,
        partnerId
      }
    });
    return engagement;
  }

  /**
   *
   * @param id
   * @return {Promise<Engagement>}
   * @throws {Error}
   */
  static async getEngagement(id) {
    return Engagement.findByPk(id, { include: ['partner', 'fellow'] });
  }

  /**
   * Update an engagement information with the given id
   * @param {number} id - engagement id
   * @param {{startDate:string, endDate:string, workHours:string}}
   * @return {Promise<Engagement>}
   * @throws {Error}
   */
  static async updateEngagement(id, { startDate, endDate, workHours, }) {
    const engagement = await PartnerService.getEngagement(id);
    await engagement.update({ startDate, endDate, workHours });
    return engagement;
  }
}

export default PartnerService;
