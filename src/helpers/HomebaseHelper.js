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
                && !CountryHelper.validateString(body[prop].trim())) {
        messages.push(`Please provide a valid string value for the field/param: '${prop}' `);
      }
      if (!body[prop] && prop !== 'country' && prop !== 'name') {
        messages.push(
          `Invalid or empty key/value pair. Provide a valid key: '${prop}' and value for the key.`
        );
      }
    });

    return messages;
  }
}

export default HomebaseHelper;
