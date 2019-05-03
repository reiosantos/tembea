import request from 'request-promise-native';
import BugsnagHelper from '../bugsnagHelper';

class UpdateSlackMessageHelper {
  static async updateMessage(payload, data) {
    try {
      const { response_url: responseUrl } = JSON.parse(payload.state);
      
      const options = {
        url: responseUrl,
        method: 'POST',
        json: true,
        body: data,
        headers: { 'content-type': 'application/json', }
      };
      const response = await request(options);
      return response;
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }
}
export default UpdateSlackMessageHelper;
