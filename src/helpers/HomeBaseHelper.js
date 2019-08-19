import HomebaseService from '../services/HomebaseService';

export default class HomeBaseHelper {
  /**
   * @description This middleware checks if the HomeBase ID is valid
   * @param  {number} id The id of the homeBase
   * @return {any} A boolean value
   */
  static async checkIfHomeBaseExists(id) {
    const homeBase = await HomebaseService.getById(id);
    return homeBase;
  }
}
