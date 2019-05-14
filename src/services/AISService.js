import request from 'request-promise-native';

import cache from '../cache';
import env from '../config/environment';
import { partnerData, AisData } from '../helpers/AISHelper';
import BugsnagHelper from '../helpers/bugsnagHelper';

export class AISService {
  constructor(apiKey, baseUrl) {
    // if (!apiKey || !baseUrl) throw new Error('AIS_API_KEY and AIS_API_BASEURL must be defined in the env variables');
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.headers = {
      'api-token': apiKey
    };
  }

  /**
   * Get a specific Andelan's data from AIS. It returns a readonly data model;
   * Look at the Andela API documentation for details: https://docs.andela.com/
   * @param {email} email
   * @return {Promise<{}>}
   * @throws {Error}
   */
  async getUserDetails(email) {
    const uri = `${this.baseUrl}/users`;
    const options = {
      qs: {
        email
      },
      headers: this.headers
    };
    try {
      if (email.indexOf('andela.com') === -1) return {};
      const key = `AIS_DATA_${email.split('@')[0]}`;
      let result = await cache.fetch(key);
      if (result) return result;
      const aisData = await request.get(uri, options);
      const {
        values
      } = JSON.parse(aisData);
      ([result] = values);
      const notOnAis = !env.NODE_ENV.includes('production') && !result;
      const notOnProduction = !env.NODE_ENV.includes('production');
      if (notOnAis) {
        result = AisData(email);
        result.placement = await partnerData[Math.floor(Math.random() * partnerData.length)];
      }
      if (notOnProduction) {
        result.placement = await partnerData[Math.floor(Math.random() * partnerData.length)];
      }
      await cache.saveObject(key, result);
      return result;
    } catch (error) {
      BugsnagHelper.log(`failed to fetch user details from AIS, reason: ${error.message}`);
      return {};
    }
  }
}

const aisService = new AISService(env.AIS_API_KEY, env.AIS_BASE_URL);

export default aisService;
