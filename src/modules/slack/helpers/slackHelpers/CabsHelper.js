

export default class CabsHelper {
  /**
   * generates the cab label to be used for a cab
   * @return {Array}
   * @param cab
   */
  static generateCabLabel(cab) {
    let format;
    if (cab.model && cab.regNumber) {
      format = `${cab.model.toUpperCase()} - ${cab.regNumber} - Seats up to ${cab.capacity} people`;
    }
    if (!cab.model) {
      format = `${cab.model || cab.regNumber} - seats up to ${cab.capacity} people`;
    }
    return format;
  }

  /**
   * maps array of cab details to 'cabmodel - regNumber' format
   * @return {Array}
   * @param cabs
   */
  static toCabLabelValuePairs(cabs) {
    return cabs.map((val) => {
      const { driverName, driverPhoneNo, regNumber } = val;
      const valueDetails = [driverName, driverPhoneNo, regNumber].toString();
      const data = {
        label: CabsHelper.generateCabLabel(val),
        value: valueDetails
      };
      return data;
    });
  }
}
