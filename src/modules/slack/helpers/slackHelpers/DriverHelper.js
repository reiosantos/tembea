export default class DriverHelper {
  /**
   * @method createDriverLabel
   * @description Creates a label for drivers
   * @param {array} drivers
   */
  static createDriverLabel(drivers) {
    return drivers.map((val) => {
      const { driverName, driverPhoneNo, driverNumber } = val;
      const valueDetails = [driverName, driverPhoneNo, driverNumber].toString();
      const driverLabel = `${driverName.toUpperCase()} - ${driverNumber}`;
      const data = {
        label: driverLabel,
        value: valueDetails
      };
      return data;
    });
  }
}
