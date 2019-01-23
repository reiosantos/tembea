import GoogleMapsMock from '../../../../helpers/googleMaps/__mocks__/GoogleMapsMock';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import SlackClientMock from '../../__mocks__/SlackClientMock';
import LocationPrompts from '../../SlackPrompts/LocationPrompts';
import RouteInputHandlers from '../RouteInputHandler';
import GoogleMapsSuggestions from '../../../../services/googleMaps/GoogleMapsSuggestions';
import GoogleMapsStatic from '../../../../services/googleMaps/GoogleMapsStatic';
import GoogleMapsReverseGeocode from '../../../../services/googleMaps/GoogleMapsReverseGeocode';
import GoogleMapsPlaceDetails from '../../../../services/googleMaps/GoogleMapsPlaceDetails';
import DialogPrompts from '../../SlackPrompts/DialogPrompts';
import bugsnagHelper from '../../../../helpers/bugsnagHelper';
import Cache from '../../../../cache';
import UserInputValidator from '../../../../helpers/slack/UserInputValidator';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../events/index.js');
jest.mock('../../../../services/TeamDetailsService');
SlackClientMock();
GoogleMapsMock();

TeamDetailsService.getTeamDetails = jest.fn(() => ({}));

describe('RouteInputHandler Tests', () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.resetAllMocks();
  });

  describe('RouteInputHandler.home Tests', () => {
    it('should call sendLocationSuggestionsResponse', async () => {
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
      LocationPrompts.sendLocationSuggestionsResponse = jest.fn().mockReturnValue({});
      await RouteInputHandlers.home(payload, respond);
      expect(LocationPrompts.sendLocationSuggestionsResponse).toHaveBeenCalled();
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
      await RouteInputHandlers.home(payload, respond);
      expect(bugsnagHelper.log).toHaveBeenCalled();
    });
  });

  describe('RouteInputHandler.suggestion Tests', () => {
    it('should call sendLocationConfirmationResponse', async () => {
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
      LocationPrompts.sendLocationConfirmationResponse = jest.fn().mockReturnValue({});
      await RouteInputHandlers.suggestions(payload, respond);
      expect(LocationPrompts.sendLocationConfirmationResponse).toHaveBeenCalled();
    });

    it('should call sendLocationCoordinatesNotFound', async () => {
      const payload = {
        submission: { coordinates: '1,1' }
      };
  
      jest.spyOn(GoogleMapsReverseGeocode, 'getAddressDetails')
        .mockImplementation().mockResolvedValueOnce({ results: [0] });
  
      LocationPrompts.sendLocationCoordinatesNotFound = jest.fn().mockReturnValueOnce({});
  
      await RouteInputHandlers.suggestions(payload, respond);
  
      expect(LocationPrompts.sendLocationCoordinatesNotFound).toHaveBeenCalled();
    });
  
    it('should catch thrown errors', async () => {
      const payload = {
        submission: {
          coordinated: '1,1'
        }
      };
      GoogleMapsReverseGeocode.getAddressDetails = jest.fn().mockImplementation(() => {
        throw new Error('Dummy error');
      });
      bugsnagHelper.log = jest.fn().mockReturnValue({});
      await RouteInputHandlers.suggestions(payload, respond);
      expect(bugsnagHelper.log).toHaveBeenCalled();
    });
  });
  
  describe('RouteInputHandler.sendLocationCoordinatesForm tests', () => {
    it('should call sendLocationCoordinatesForm', async () => {
      const payload = {
        actions: [{ value: 'no' }]
      };
      DialogPrompts.sendLocationCoordinatesForm = jest.fn().mockReturnValue({});
      await RouteInputHandlers.locationNotFound(payload, respond);
      expect(DialogPrompts.sendLocationCoordinatesForm).toHaveBeenCalled();
    });

    it('should call sendLocationForm', async () => {
      const payload = {
        actions: [{ value: 'retry' }]
      };
      DialogPrompts.sendLocationForm = jest.fn().mockReturnValue({});
      await RouteInputHandlers.locationNotFound(payload, respond);
      expect(DialogPrompts.sendLocationForm).toHaveBeenCalled();
    });
  });

  describe('RouteInputHandler.runValidations tests', () => {
    it('should return coordinates validation errors if they exist', async () => {
      const payload = {
        submission: { coordinates: '1,1' }
      };
      jest.spyOn(UserInputValidator, 'validateCoordinates')
        .mockImplementation().mockReturnValueOnce([]);
      const errors = await RouteInputHandlers.runValidations(payload);
      expect(errors.length).toEqual(0);
    });
  
    it('should catch validation errors', async () => {
      const payload = {
        submission: { coordinates: 'bad coordinates' }
      };
  
      jest.spyOn(UserInputValidator, 'validateCoordinates')
        .mockImplementation().mockReturnValueOnce(['error']);
  
      const errors = await RouteInputHandlers.runValidations(payload);
      expect(errors.length).toEqual(1);
    });
  });

  describe('RouteInputHandler: Bus Stop handler', () => {
    let payload;
    beforeEach(() => {
      payload = {
        channel: {},
        team: {},
        actions: [{ value: '12' }],
        submission:
          {
            otherBusStop: 'san',
            selectBusStop: null,
          }
      };
    });
  
    afterEach(() => {
      jest.resetModules();
      jest.resetAllMocks();
    });
  
    describe('handleBusStopRoute', () => {
      it('handleBusStopRoute throw error', async (done) => {
        await RouteInputHandlers.handleBusStopRoute(payload, respond);
        expect(respond).toHaveBeenCalled();
        done();
      });
  
      it('handleBusStopRoute: send dialog', async (done) => {
        payload.actions[0].value = '23,23';
  
        await RouteInputHandlers.handleBusStopRoute(payload, respond);
        expect(respond).toHaveBeenCalledTimes(1);
        done();
      });
    });
  
    describe('handleBusStopSelected', () => {
      it('handleBusStopSelected error. invalid coordinate', async (done) => {
        const resp = await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(respond).toHaveBeenCalledTimes(0);
        expect(resp).toEqual({
          errors:
            [{ error: 'You must submit a valid coordinate', name: 'otherBusStop' }]
        });
        done();
      });
  
      it('handleBusStopSelected error. both fields submitted', async (done) => {
        payload = {
          ...payload,
          submission: { otherBusStop: 'san', selectBusStop: 'san', }
        };
        const resp = await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(respond).toHaveBeenCalledTimes(0);
        expect(resp).toEqual({
          errors:
            [{
              error: 'You can not fill in this field if you selected a stop in the drop down',
              name: 'otherBusStop'
            }]
        });
        done();
      });
  
      it('handleBusStopSelected error. none of the fields is submitted', async (done) => {
        payload = {
          ...payload,
          submission: {}
        };
        const resp = await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(respond).toHaveBeenCalledTimes(0);
        expect(resp).toEqual({
          errors:
            [{ error: 'One of the fields must be filled.', name: 'otherBusStop' }]
        });
        done();
      });
  
      it('handleBusStopSelected with valid coordinates', async (done) => {
        payload = {
          ...payload,
          submission: { selectBusStop: '34,45' }
        };
        jest.spyOn(GoogleMapsStatic, 'getPathFromDojoToDropOff')
          .mockResolvedValue('https://maps.googleapis.com/maps/api/staticmap?eikks');
        await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(GoogleMapsStatic.getPathFromDojoToDropOff).toHaveBeenCalledTimes(1);
        expect(respond).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });
});
