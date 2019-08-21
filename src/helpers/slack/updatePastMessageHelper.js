import request from 'request-promise-native';
import BugsnagHelper from '../bugsnagHelper';

class UpdateSlackMessageHelper {
  static async updateMessage(state, data) {
    try {
      const { response_url: responseUrl } = JSON.parse(state);
      return UpdateSlackMessageHelper.sendMessage(responseUrl, data);
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  static async sendMessage(url, data) {
    try {
      const options = {
        url,
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

  static async deleteMessage(responseUrl) {
    try {
      const options = {
        url: responseUrl,
        method: 'DELETE',
        resolveWithFullResponse: true
      };
      const response = await request(options);
      return response;
    } catch (error) {
      BugsnagHelper.log(error);
    }
  }

  static async newUpdateMessage(responseUrl, newMessage) {
    return UpdateSlackMessageHelper.sendMessage(responseUrl, newMessage);
  }
}

export default UpdateSlackMessageHelper;
