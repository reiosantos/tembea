import request from 'request-promise-native';
import BugsnagHelper from '../bugsnagHelper';

class UpdateSlackMessageHelper {
  static async updateMessage(state, data) {
    try {
      const { response_url: responseUrl } = JSON.parse(state);

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
