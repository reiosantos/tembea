import moment from 'moment';
import {
  GoogleMapsLocationSuggestionOptions,
  Marker,
  RoutesHelper
} from '../../../helpers/googleMaps/googleMapsHelpers';
import GoogleMapsSuggestions from '../../../services/googleMaps/GoogleMapsSuggestions';
import GoogleMapsStatic from '../../../services/googleMaps/GoogleMapsStatic';
import InteractivePrompts from '../SlackPrompts/InteractivePrompts';
import DialogPrompts from '../SlackPrompts/DialogPrompts';
import bugsnagHelper from '../../../helpers/bugsnagHelper';
import GoogleMapsPlaceDetails from '../../../services/googleMaps/GoogleMapsPlaceDetails';
import Cache from '../../../cache';
import UserInputValidator from '../../../helpers/slack/UserInputValidator';
import { SlackInteractiveMessage } from '../SlackModels/SlackMessageModels';
import GoogleMapsService from '../../../services/googleMaps';
import RouteRequestService from '../../../services/RouteRequestService';
import PartnerService from '../../../services/PartnerService';
import validateBusStop from '../../../helpers/googleMaps/busStopValidation';
import LocationPrompts from '../SlackPrompts/LocationPrompts';
import PreviewPrompts from '../SlackPrompts/PreviewPrompts';
import AddressService from '../../../services/AddressService';
import SlackHelpers from '../../../helpers/slack/slackHelpers';
import { slackEventNames, SlackEvents } from '../events/slackEvents';
import createNavButtons from '../../../helpers/slack/navButtons';
import createSearchButton from '../../../helpers/slack/searchButton';
import GoogleMapsDistanceMatrix from '../../../services/googleMaps/GoogleMapsDistanceMatrix';

const getAction = (payload, btnAction) => {
  const { actions, callback_id: callBackId } = payload;
  let action = callBackId.split('_')[2];
  if (action === btnAction) {
    ([{ name: action }] = actions);
  }
  return action;
};

export {
  moment, GoogleMapsLocationSuggestionOptions,
  Marker,
  RoutesHelper, GoogleMapsStatic, InteractivePrompts, bugsnagHelper,
  GoogleMapsPlaceDetails, Cache, UserInputValidator, SlackInteractiveMessage,
  GoogleMapsService, DialogPrompts,
  RouteRequestService,
  PartnerService, GoogleMapsDistanceMatrix,
  GoogleMapsSuggestions,
  validateBusStop, PreviewPrompts,
  LocationPrompts, AddressService, SlackHelpers,
  slackEventNames, SlackEvents,
  createNavButtons,
  createSearchButton,
  getAction,
};
