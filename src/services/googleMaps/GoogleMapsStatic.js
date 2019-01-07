class GoogleMapsStatic {
  /**
   * @description This method gets a screenshot of a location from google
   * @param  {Object[]} markers An array of markers
   * @param  {string} size A string for the image size default if (700x700)
   * @param  {string} zoom A number that represents the zoom scale
   * @returns The image URL
   */
  static getLocationScreenShotUrl(
    markers,
    size = '700x700',
    zoom = ''
  ) {
    const stringedMarkers = GoogleMapsStatic.generateQueryParams(markers);
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=${size}${stringedMarkers}&zoom=${zoom}$&key=${apiKey}`;
    return url;
  }

  /**
   * @description Builds the query parameters as a string
   * @param  {Object[]} markers The markers to be converted to query params
   * @returns {string} A string of the markers
   */
  static generateQueryParams(markers) {
    let stringedMarkers = '';
    markers.forEach((item) => {
      const { color, label, locations } = item;
      stringedMarkers += (`&markers=color:${color}|label:${label}${locations}`);
    });

    return stringedMarkers;
  }
}

export default GoogleMapsStatic;
