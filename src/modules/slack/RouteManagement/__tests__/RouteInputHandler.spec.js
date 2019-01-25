import googleClient from '@google/maps';
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
import GoogleMapsService from '../../../../services/googleMaps';
import RouteInputHandlerHelper from '../RouteInputHandlerHelper';
import PreviewPrompts from '../../SlackPrompts/PreviewPrompts';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import dummyMockData from './dummyMockData';

import { SlackInteractiveMessage } from '../../SlackModels/SlackMessageModels';
import { SlackEvents, slackEventNames } from '../../events/slackEvents';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../events/index.js');
jest.mock('../../../../services/TeamDetailsService');
jest.mock('@google/maps');

jest.mock('../../events/', () => ({
  slackEvents: jest.fn(() => ({
    raise: jest.fn(),
    handle: jest.fn()
  })),
}));

const mockedCreateClient = { placesNearby: jest.fn() };
SlackClientMock();
GoogleMapsMock();

TeamDetailsService.getTeamDetails = jest.fn(() => ({}));

describe('RouteInputHandler Tests', () => {
  let respond;
  beforeEach(() => {
    respond = jest.fn();
    googleClient.createClient.mockImplementation(() => (mockedCreateClient));
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
        team: { id: 1 },
        user: { id: 1 },
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
      beforeEach(() => {
        const asPromise = jest.fn().mockResolvedValue({ json: { results: ['Test'] } });
        mockedCreateClient.placesNearby.mockImplementation(() => ({
          asPromise
        }));
        jest.spyOn(DialogPrompts, 'sendBusStopForm').mockResolvedValue({});
        jest.spyOn(Cache, 'save').mockResolvedValue();
        jest.spyOn(GoogleMapsService, 'mapResultsToCoordinates').mockResolvedValue(
          [{
            label: 'USIU Stage',
            text: 'USIU Stage',
            value: '-1.2249681,36.8853843'
          }]
        );
      });
      afterEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
      });
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

      it('should get the value for the nearest bus stop', async () => {
        const maps = new GoogleMapsService();
        jest.spyOn(maps, 'findNearestBusStops').mockImplementation([{}]);
        payload.actions[0].value = '23,23';

        await RouteInputHandlers.handleBusStopRoute(payload, respond);
        expect(GoogleMapsService.mapResultsToCoordinates).toBeCalled();
      });

      it('should send bus stop Dialog form ', async () => {
        payload.actions[0].value = '23,23';
        await RouteInputHandlers.handleBusStopRoute(payload, respond);
        expect(DialogPrompts.sendBusStopForm).toBeCalled();
      });
    });

    describe('handleBusStopSelected', () => {
      jest.spyOn(DialogPrompts, 'sendBusStopForm').mockResolvedValue();
      jest.spyOn(GoogleMapsStatic, 'getPathFromDojoToDropOff')
        .mockResolvedValue('https://sampleMapurl');
      jest.spyOn(Cache, 'fetch').mockResolvedValue([{}, {}]);
      jest.spyOn(Cache, 'save').mockResolvedValue();
      // jest.spyOn(mockedGetLocationDetailsFromCache, 'getLocationDetailsFromCache')
      // mockedValidateBusStop.validateBusStop.mockImplementation(null);
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

      it('handleBusStopSelected with valid coordinates', async () => {
        payload = {
          ...payload,
          submission: { selectBusStop: '34,45' }
        };
        const previewData = {};
        jest.spyOn(RouteInputHandlerHelper, 'resolveDestinationPreviewData')
          .mockReturnValue(previewData);
        jest.spyOn(PreviewPrompts, 'displayDestinationPreview')
          .mockReturnValue({});
        jest.spyOn(RouteInputHandlerHelper, 'savePreviewDataToCache')
          .mockReturnValue({});
        await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(PreviewPrompts.displayDestinationPreview).toHaveBeenCalledWith(previewData);
      });
      it('handleBusStopSelected with invalid distance coordinates', async () => {
        payload = {
          ...payload,
          submission: { selectBusStop: '34,45' }
        };
        const previewData = { validationError: { test: 'AAAAAA' } };
        jest.spyOn(RouteInputHandlerHelper, 'resolveDestinationPreviewData')
          .mockReturnValue(previewData);
        jest.spyOn(PreviewPrompts, 'displayDestinationPreview')
          .mockReturnValue({});
        jest.spyOn(RouteInputHandlerHelper, 'savePreviewDataToCache')
          .mockReturnValue({});
        const result = await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(result).toBe(previewData.validationError);
        expect(PreviewPrompts.displayDestinationPreview).not.toHaveBeenCalled();
      });
      it('handleBusStopSelected should handle error properly', async () => {
        payload = {
          ...payload,
          submission: { selectBusStop: '34,45' }
        };
        const previewData = { validationError: { test: 'AAAAAA' } };
        jest.spyOn(RouteInputHandlerHelper, 'resolveDestinationPreviewData')
          .mockRejectedValue(previewData);
        jest.spyOn(PreviewPrompts, 'displayDestinationPreview')
          .mockReturnValue({});
        jest.spyOn(RouteInputHandlerHelper, 'savePreviewDataToCache')
          .mockReturnValue({});
        jest.spyOn(bugsnagHelper, 'log')
          .mockReturnValue({});
        await RouteInputHandlers.handleBusStopSelected(payload, respond);
        expect(bugsnagHelper.log).toHaveBeenCalled();
        expect(PreviewPrompts.displayDestinationPreview).not.toHaveBeenCalled();
      });
    });
  });

  describe('RouteInputHandlers_handleNewRouteRequest', () => {
    beforeEach(() => {
      jest.spyOn(DialogPrompts, 'sendNewRouteForm').mockResolvedValue();
    });
    it('should handle route request', async () => {
      const payload = { actions: [{ value: 'lunchNewRoutePrompt' }] };
      await RouteInputHandlers.handleNewRouteRequest(payload, respond);
      expect(DialogPrompts.sendNewRouteForm).toBeCalled();
    });
  });
  describe('RouteInputHandlers_handlePreviewPartnerInfo', () => {
    const { partnerInfo: { userId, teamId }, locationInfo, partnerInfo } = dummyMockData;
    beforeEach(() => {
      jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockResolvedValue(partnerInfo);
      jest.spyOn(Cache, 'fetch').mockResolvedValue({ locationInfo });
      jest.spyOn(PreviewPrompts, 'sendPartnerInfoPreview').mockResolvedValue();
    });
    it('should display a preview of the fellows information', async () => {
      const payload = { user: { id: userId }, team: { id: teamId } };
      await RouteInputHandlers.handlePreviewPartnerInfo(payload, respond);
      expect(PreviewPrompts.sendPartnerInfoPreview).toBeCalled();
    });
  });
  describe('RouteInputHandlers_handlePartnerForm', () => {
    const { partnerInfo: { userId, teamId } } = dummyMockData;
    beforeEach(() => {
      jest.spyOn(RouteInputHandlerHelper, 'handleRouteRequestSubmission')
        .mockResolvedValue({ id: userId });
    });
    it('should submit the preview form', async () => {
      const payload = { team: { id: teamId } };
      await RouteInputHandlers.handlePartnerForm(payload, respond);
      expect(RouteInputHandlerHelper.handleRouteRequestSubmission).toBeCalled();
    });

    it('should throw an error when it cannot trigger notification', async () => {
      jest.spyOn(RouteInputHandlerHelper, 'handleRouteRequestSubmission').mockResolvedValue();
      const payload = { team: { id: null } };
      const res = await RouteInputHandlers.handlePartnerForm(payload, respond);
      expect(res).toBeFalsy();
    });
  });

  describe('handleNewRouteRequest', () => {
    let payload;
    beforeEach(() => {
      payload = {
        team: { id: 'AAAAAA' }
      };
    });
    it('should notify manager when submission is valid', async () => {
      jest.spyOn(RouteInputHandlerHelper, 'handleRouteRequestSubmission')
        .mockResolvedValue({ id: 'BBBBBB' });
      jest.spyOn(SlackEvents, 'raise').mockReturnValue();
      await RouteInputHandlers.handlePartnerForm(payload, respond);
      expect(SlackEvents.raise.mock.calls[0][0]).toBe(slackEventNames.NEW_ROUTE_REQUEST);
      expect(respond).toHaveBeenCalledWith(
        new SlackInteractiveMessage('Your request have been successfully saved ')
      );
    });
  });
});
