export class Marker {
  /**
   * @description Creats an instance of a google map marker
   * @returns {object} The marker array
   */
  constructor(color = 'blue', label = '') {
    this.color = color;
    this.label = label;
    this.locations = '';
  }

  /**
   * @description Add a location to a group of markers
   * @param  {string} location A confirmed google map recognised location
   */
  addLocation(location) {
    this.locations = this.locations.concat('|', location);
  }
}
