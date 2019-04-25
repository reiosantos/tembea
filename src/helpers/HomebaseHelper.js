import GeneralValidator from '../middlewares/GeneralValidator';
import CountryHelper from './CountryHelper';

class HomebaseHelper {
  /**
     * @description This middleware checks that props passed are valid
     * @param body The request body/query
     * @param props An array of properties
     * @return {array} An array of messages
     */
  static validateProps(body, ...props) {
    const messages = [];
    props.forEach((prop) => {
      if (!GeneralValidator.isEmpty(body[prop])
                && !CountryHelper.validateString(body[prop])) {
        messages.push(`Please provide a valid string value for the field: '${prop}' `);
      }
      if (!body[prop] && prop !== 'country' && prop !== 'homebase') {
        messages.push(
          // eslint-disable-next-line max-len
          `Invalid or empty key/value pair. Please provide a valid key: '${prop}' and value for the key.`
        );
      }
    });

    return messages;
  }
}

export default HomebaseHelper;
