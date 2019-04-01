import googleClient from '@google/maps';
import GoogleMapsMock from '../__mocks__/GoogleMapsMock';
import TeamDetailsService from '../../../services/TeamDetailsService';
import SlackClientMock from '../../../modules/slack/__mocks__/SlackClientMock';
import LocationPrompts from '../../../modules/slack/SlackPrompts/LocationPrompts';
import GoogleMapsSuggestions from '../../../services/googleMaps/GoogleMapsSuggestions';
import GoogleMapsStatic from '../../../services/googleMaps/GoogleMapsStatic';
import GoogleMapsReverseGeocode from '../../../services/googleMaps/GoogleMapsReverseGeocode';
import GoogleMapsPlaceDetails from '../../../services/googleMaps/GoogleMapsPlaceDetails';
import bugsnagHelper from '../../bugsnagHelper';
import Cache from '../../../cache';
import LocationHelpers from '../locationsMapHelpers';

jest.mock('../../../utils/WebClientSingleton.js');
jest.mock('../../../modules/slack/events/index.js');
jest.mock('../../../services/TeamDetailsService');
jest.mock('@google/maps');

jest.mock('../../../modules/slack/events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));

const mockedCreateClient = { placesNearby: jest.fn() };
SlackClientMock();
GoogleMapsMock();

TeamDetailsService.getTeamDetails = jest.fn(() => ({}));

const pickUpString = 'pickup';
const destinationString = 'destination';
const pickupPayload = {
  submission: {
    pickup: 'Nairobi',
    othersPickup: ''
  }
};

const destinationPayload = {
  submission: {
    destination: 'Kisumu',
    othersDestination: '',
  }
};

const pickupOthers = {
  submission: {
    pickup: 'Others',
    othersPickup: 'Allsops'
  }
};

const destinationOthers = {
  submission: {
    destination: 'Others',
    othersDestination: 'Kigali',
  }
};

describe('Tests for google maps locations', () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
    googleClient.createClient.mockImplementation(() => (mockedCreateClient));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should check trip type and return required response', () => {
    expect(LocationHelpers.checkTripType(pickUpString, pickupPayload)).toEqual('Nairobi');
    expect(LocationHelpers.checkTripType(destinationString, destinationPayload)).toEqual('Kisumu');

    expect(LocationHelpers.checkTripType(pickUpString, pickupOthers)).toEqual('Allsops');
    expect(LocationHelpers.checkTripType(destinationString, destinationOthers)).toEqual('Kigali');
  });

  it('should call sendMapSuggestionsResponse', async () => {
    const payload = {
      type: 'dialog_submission',
      submission: {
        location: 'test location'
      }
    };
    GoogleMapsSuggestions.getPlacesAutoComplete = jest.fn().mockResolvedValue(
      { predictions: [{ description: 'Test Location', place_id: 'xxxxx' }] }
    );
    GoogleMapsStatic.getLocationScreenShotUrl = jest.fn().mockReturnValue('staticMapUrl');
    LocationPrompts.sendMapSuggestionsResponse = jest.fn().mockReturnValue({});
    await LocationHelpers.locationVerify(payload, respond, pickUpString, 'travel_trip');
    expect(LocationPrompts.sendMapSuggestionsResponse).toHaveBeenCalled();
  });

  it('should catch thrown errors', async () => {
    const payload = {
      type: 'dialog_submission',
      submission: {
        location: 'test location'
      }
    };
    GoogleMapsSuggestions.getPlacesAutoComplete = jest.fn().mockImplementation(() => {
      throw new Error('Dummy error');
    });
    bugsnagHelper.log = jest.fn().mockReturnValue({});
    await LocationHelpers.locationVerify(payload, respond, pickUpString);
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });

  it('Should not return "other" if destination or pick up is other', () => {
    const tripData = {
      destination: 'Others', othersDestination: 'Nairobi', pickup: 'Others', othersPickup: 'Dojo'
    };
    const newTripData = {
      destination: 'Nairobi', othersDestination: 'Nairobi', pickup: 'Dojo', othersPickup: 'Dojo'
    };
    const returnData = LocationHelpers.tripCompare(tripData);
    expect(returnData).toEqual(newTripData);
  });
});

describe('Tests for google maps suggestions', () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
    googleClient.createClient.mockImplementation(() => (mockedCreateClient));
  });

  it('should call sendMapSuggestionsResponse', async () => {
    const payload = {
      user: { id: 1 },
      type: 'dialog_submission',
      actions: [{
        selected_options: [{ value: 'xxxxx' }]
      }]
    };

    GoogleMapsReverseGeocode.getAddressDetails = jest.fn().mockResolvedValue({
      results: [{ geometry: { location: { lat: 1, lng: 1 } }, place_id: 'xxxx' }]
    });
    GoogleMapsPlaceDetails.getPlaceDetails = jest.fn().mockResolvedValue({
      result: { formatted_address: 'Test Location Address', name: 'Test Location Name' }
    });
    GoogleMapsStatic.getLocationScreenShotUrl = jest.fn().mockReturnValue('staticMapUrl');
    Cache.saveObject = jest.fn().mockResolvedValue({});
    LocationPrompts.sendMapSuggestionsResponse = jest.fn().mockReturnValue({});
    LocationHelpers.sendResponse = jest.fn().mockReturnValue({});
    await LocationHelpers.locationSuggestions(payload, respond, 'pickupBtn');
    expect(LocationHelpers.sendResponse).toHaveBeenCalled();
  });

  it('should call sendLocationCoordinatesNotFound', async () => {
    const payload = {
      submission: { coordinates: '1,1' }
    };

    jest.spyOn(GoogleMapsReverseGeocode, 'getAddressDetails')
      .mockImplementation().mockResolvedValueOnce({ results: [0] });

    LocationPrompts.sendLocationCoordinatesNotFound = jest.fn().mockReturnValueOnce({});

    await LocationHelpers.locationSuggestions(payload, respond, 'pickupBtn');

    expect(LocationPrompts.sendLocationCoordinatesNotFound).toHaveBeenCalled();
  });

  it('should catch thrown errors', async () => {
    const payload = {
      type: 'dialog_submission',
      submission: {
        location: 'test location'
      }
    };
    GoogleMapsPlaceDetails.getPlaceDetails = jest.fn().mockImplementation(() => {
      throw new Error('Dummy error');
    });
    bugsnagHelper.log = jest.fn().mockReturnValue({});
    await LocationHelpers.locationSuggestions(payload, respond, pickUpString);
    expect(bugsnagHelper.log).toHaveBeenCalled();
  });
});

describe('helper functions', async () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const locationData = {
    address: 'Nairobi', latitude: '1234567', longitude: '34567890'
  };
  const payload = {
    user: {
      id: '1'
    }
  };
  const stateLocation = 'destinationAddress';
  const trip = 'travel_trip';

  it('it should call sendMapsConfirmationResponse', async () => {
    Cache.save = jest.fn().mockReturnValue({});
    LocationPrompts.sendMapsConfirmationResponse = jest.fn().mockReturnValue({});
    await LocationHelpers.locationPrompt(locationData, respond, payload, stateLocation, trip);
    expect(LocationPrompts.sendMapsConfirmationResponse).toBeCalled();
    expect(Cache.save).toBeCalled();
  });
});
