import { Marker } from '../../helpers/googleMaps/googleMapsHelpers';
import GoogleMapsStatic from '../googleMaps/GoogleMapsStatic';

describe('Google map static', () => {
  it('should be able to fetch an image from google', async () => {
    const markers = [new Marker('blue', 'A')];
    markers[0].addLocation('The Dojo');

    const imageUrl = await GoogleMapsStatic.getLocationScreenShotUrl(markers);
    expect(/^https:\/\/maps.googleapis/.test(imageUrl)).toBe(true);
  });
});

describe('generateQueryParams', () => {
  it('should generate the correct params', () => {
    const markers = [new Marker('blue', 'A')];
    markers[0].addLocation('The Dojo');

    const stringedMarkers = GoogleMapsStatic.generateQueryParams(markers);
    expect(stringedMarkers).toEqual('&markers=color:blue|label:A|The Dojo');
  });
});
