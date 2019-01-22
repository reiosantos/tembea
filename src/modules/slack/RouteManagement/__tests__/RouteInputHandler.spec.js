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
import { slackEventNames, SlackEvents } from '../../events/slackEvents';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import AddressService from '../../../../services/AddressService';
import PartnerService from '../../../../services/PartnerService';
import RouteRequestService from '../../../../services/RouteRequestService';
import { mockRouteRequestData } from '../../../../services/__mocks__';

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
    jest.restoreAllMocks();
  });

  describe('RouteInputHandler.home Tests', () => {
    beforeEach(() => {
      jest.spyOn(GoogleMapsSuggestions, 'getPlacesAutoComplete');
      jest.spyOn(GoogleMapsStatic, 'getLocationScreenShotUrl');
      jest.spyOn(GoogleMapsStatic, 'getLocationScreenShotUrl');
      jest.spyOn(bugsnagHelper, 'log');
    });
    it('should call sendLocationSuggestionsResponse', async () => {
      const payload = {
        type: 'dialog_submission',
        submission: {
          location: 'test location'
        }
      };
      GoogleMapsSuggestions.getPlacesAutoComplete.mockResolvedValue(
        { predictions: [{ description: 'Test Location', place_id: 'xxxxx' }] }
      );
      GoogleMapsStatic.getLocationScreenShotUrl.mockReturnValue('staticMapUrl');
      jest.spyOn(LocationPrompts, 'sendLocationSuggestionsResponse');
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
      GoogleMapsSuggestions.getPlacesAutoComplete.mockImplementation(() => {
        throw new Error('Dummy error');
      });
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
        user: { id: '1' },
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
        jest.spyOn(RouteInputHandlers, 'handlePartnerForm')
          .mockReturnValue();
        jest.spyOn(Cache, 'save')
          .mockReturnValue();
        jest.spyOn(Cache, 'fetch')
          .mockReturnValue({ busStageList: [{ value: '34,45', text: '' }] });
        jest.spyOn(GoogleMapsStatic, 'getPathFromDojoToDropOff')
          .mockReturnValue('https://dummy-url');
        await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(GoogleMapsStatic.getPathFromDojoToDropOff).toHaveBeenCalledTimes(1);
        expect(respond).toHaveBeenCalledTimes(1);
        done();
      });
    });
  });

  describe('RouteInputHandler: handle partner form', () => {
    let payload;
    beforeEach(() => {
      payload = {
        user: { id: 'AAAAAA' },
        team: { id: 'BBBBBB' },
        submission: {
          partnerName: 'CCCCCC',
          managerId: 'DDDDDD',
          workHours: '20:30-02:30',
          distance: 2.2,
          busStopDistance: 1.7,
        }
      };
      jest.spyOn(Cache, 'fetch')
        .mockResolvedValue({
          homeAddress: {
            longitude: 'AAAAAA',
            latitude: 'BBBBBB',
            address: 'CCCCCC'
          },
          busStop: {
            longitude: 'DDDDDD',
            latitude: 'EEEEEE',
            address: 'FFFFFF'
          },
        });

      const {
        busStop, engagement, home, manager
      } = mockRouteRequestData;
      const { partner, fellow } = engagement;

      jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId');
      SlackHelpers.findOrCreateUserBySlackId.mockResolvedValue(manager);
      SlackHelpers.findOrCreateUserBySlackId.mockResolvedValue(fellow);

      jest.spyOn(AddressService, 'createNewAddress');
      AddressService.createNewAddress.mockResolvedValue(busStop);
      AddressService.createNewAddress.mockResolvedValue(home);

      jest.spyOn(PartnerService, 'findOrCreatePartner')
        .mockResolvedValue(partner);
      jest.spyOn(PartnerService, 'findOrCreateEngagement')
        .mockResolvedValue(engagement);

      jest.spyOn(SlackEvents, 'raise')
        .mockResolvedValue();

      jest.spyOn(RouteRequestService, 'createRoute');
    });
    it('should properly handle errors', async () => {
      RouteRequestService.createRoute.mockResolvedValue(mockRouteRequestData);

      await RouteInputHandlers.handlePartnerForm(payload, respond);

      expect(SlackEvents.raise)
        .toHaveBeenCalledTimes(1);
      expect(SlackEvents.raise.mock.calls[0][0])
        .toBe(slackEventNames.NEW_ROUTE_REQUEST);
    });
    it('should raise event to send manager notification when success', async () => {
      const msg = 'Random message';
      RouteRequestService.createRoute.mockRejectedValue(new Error(msg));
      jest.spyOn(bugsnagHelper, 'log');
      await RouteInputHandlers.handlePartnerForm(payload, respond);

      expect(SlackEvents.raise).not.toHaveBeenCalled();
      expect(bugsnagHelper.log).toHaveBeenCalled();
      expect(bugsnagHelper.log.mock.calls[0][0].message)
        .toBe(msg);
    });
  });
});
