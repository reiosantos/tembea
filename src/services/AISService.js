import request from 'request-promise-native';
import cache from '../cache';

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
      const key = `AIS_DATA_${email.split('@')[0]}`;
      let result = await cache.fetch(key);
      if (result) return result;
      const aisData = await request.get(uri, options);
      const { values } = JSON.parse(aisData);
      ([result] = values);
      await cache.saveObject(key, result);
      return result;
    } catch (error) {
      throw new Error(`failed to fetch user details from AIS, reason: ${error.message}`);
    }
  }
}

const aisService = new AISService(process.env.AIS_API_KEY, process.env.AIS_API_BASEURL);

export default aisService;
