class GeneralValidator {
  /**
   * @description This method checks the object passed for the passed properties
   * @param  {object} body The body of the request object
   * @param  {string} ...props The name of the property
   * @returns {array} An array of messages of the missing properties
   */
  static validateReqBody(body, ...props) {
    const messages = [];

    props.forEach((prop) => {
      if (!body[prop]) {
        messages.push(`Please provide ${prop}.`);
      }
    });

    return messages;
  }

  /**
   * @description This method checks if the objects passed in the request body are empty
   * @param  {object} body The body of the request object
   * @param  {string} ...props The name of the property
   * @returns {array} An array of messages of the empty properties
   */
  static validateEmptyReqBodyProp(body, ...props) {
    const messages = [];
    props.forEach((prop) => {
      if (body[prop] !== undefined && (body[prop]).trim().length === 0) {
        messages.push(`Please provide a value for ${prop}.`);
      }
    });

    return messages;
  }
}

export default GeneralValidator;
