

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

  static generateDriverLabel(driver) {
    let format = '';
    if (driver.driverName && driver.driverPhoneNo) {
      format = `${driver.driverName.toUpperCase()} - (${driver.driverPhoneNo})`;
    }
    return format;
  }


  /**
   * maps array of cab details to 'cabmodel - regNumber' format
   * @return {Array}
   * @param cabs
   */
  static toCabLabelValuePairs(cabs, hasText = false) {
    return cabs.map((val) => {
      const {
        id, capacity, model, regNumber
      } = val;
      const valueDetails = [id, capacity, model, regNumber].toString();
      let data = {
        label: CabsHelper.generateCabLabel(val),
        value: valueDetails
      };
      if (hasText) {
        data = {
          text: CabsHelper.generateCabLabel(val),
          value: valueDetails
        };
      }
      return data;
    });
  }
  

  static driverLabel(drivers) {
    return drivers.map((val) => {
      const { id } = val;
      const text = {
        text: CabsHelper.generateDriverLabel(val),
        value: id
      };
      return text;
    });
  }

  static toCabDriverValuePairs(drivers) {
    return drivers.map((val) => {
      const {
        id, driverName, driverPhoneNo, driverNumber
      } = val;
      const valueDetails = [id, driverName, driverPhoneNo, driverNumber].toString();
      const data = {
        label: CabsHelper.generateDriverLabel(val),
        value: valueDetails
      };
      return data;
    });
  }
}
