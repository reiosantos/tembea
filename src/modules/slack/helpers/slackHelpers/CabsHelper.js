
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
      let data = {
        label: CabsHelper.generateCabLabel(val),
        value: val.id
      };
      if (hasText) {
        data = {
          text: CabsHelper.generateCabLabel(val),
          value: val.id
        };
      }
      return data;
    });
  }

  static toCabDriverValuePairs(drivers, hasText) {
    return drivers.map((val) => {
      const driverLabel = CabsHelper.generateDriverLabel(val);
      const label = { label: driverLabel };
      const text = { text: driverLabel };
      const value = { value: val.id };
      const textOrLabel = hasText ? text : label;
      const data = { ...textOrLabel, ...value };
      return data;
    });
  }
}
