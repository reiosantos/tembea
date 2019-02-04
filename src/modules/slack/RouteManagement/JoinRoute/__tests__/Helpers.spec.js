import JoinRouteHelpers from '../JoinRouteHelpers';
import Cache from '../../../../../cache';
import PartnerService from '../../../../../services/PartnerService';
import { SlackHelpers } from '../../rootFile';
import JoinRouteRequestService from '../../../../../services/JoinRouteRequestService';
import RouteService from '../../../../../services/RouteService';
import Utils from '../../../../../utils/index';
import { SlackAttachment } from '../../../SlackModels/SlackMessageModels';

describe('JoinRouteHelpers', () => {
  const submission = {
    manager: 'managerId',
    partnerName: 'partner',
    workHours: '18:00-00:00',
    startDate: '12/12/2019',
    endDate: '12/12/2020'
  };
  const payload = {
    callback_id: 'join_route_Test_1',
    user: { id: 'slackId', name: 'test.user' },
    team: { id: 'teamId' }
  };
  const data = { id: 2 };
  const routeData = {
    id: 2,
    capacity: '0/4',
    riders: [1, 2],
    takeOff: '00:00',
    route: {
      imageUrl: 'routeImageUrl',
      name: 'routeName',
      destination: { address: 'address' }
    },
  };
  let routeBatch;
  let fetch;
  let save;
  let partner;
  let engagement;
  let user;
  let joinRequest;
  let fetchJoinRequest;
  beforeEach(() => {
    routeBatch = jest.spyOn(RouteService, 'getRouteBatchByPk')
      .mockReturnValue(routeData);
    fetch = jest.spyOn(Cache, 'fetch').mockResolvedValue({
      manager: 'managerId',
      partnerName: 'partner',
      workHours: 'workHours',
      startDate: 'startDate',
      endDate: 'endDate'
    });
    save = jest.spyOn(Cache, 'saveObject').mockImplementation(jest.fn());
    partner = jest.spyOn(PartnerService, 'findOrCreatePartner').mockResolvedValue(data);
    engagement = jest.spyOn(PartnerService, 'findOrCreateEngagement').mockResolvedValue(data);
    user = jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockResolvedValue(data);
    joinRequest = jest.spyOn(JoinRouteRequestService, 'createJoinRouteRequest')
      .mockResolvedValue({ id: 1 });
    fetchJoinRequest = jest.spyOn(JoinRouteRequestService, 'getJoinRouteRequest')
      .mockResolvedValue({
        manager: { slackId: 'managerId' },
        engagement: {
          workHours: '18:00-00:00',
          startDate: '12/12/2019',
          endDate: '12/12/2020',
          partner: { name: 'partner' }
        }
      });
  });
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('getName', () => {
    it('should return a string of split words given a string', () => {
      const result = JoinRouteHelpers.getName('test.user');
      expect(result).toEqual('Test User');
    });
  });
  describe('getRouteBatch', () => {
    it('should return routeBatch', async () => {
      const result = await JoinRouteHelpers.getRouteBatch(payload);
      expect(result).toEqual(routeData);
    });
  });
  describe('saveJoinRouteRequest', () => {
    it('should save join route request', async () => {
      const result = await JoinRouteHelpers.saveJoinRouteRequest(payload);
      expect(fetch).toBeCalledWith('joinRouteRequestSubmission_slackId');
      expect(partner).toBeCalledWith('partner');
      expect(user).toBeCalledWith('slackId', 'teamId');
      expect(user).toBeCalledWith('managerId', 'teamId');
      expect(engagement).toBeCalled();
      expect(routeBatch).toBeCalledWith('1');
      expect(joinRequest).toBeCalledWith(2, 2, 2);
      expect(result).toEqual({ id: 1 });
    });
  });
  describe('getJoinRouteRequest', () => {
    const engagementData = {
      id: null,
      slackId: 'slackId',
      submission
    };
    it('should get engagement details from payload submission', async () => {
      const result = await JoinRouteHelpers.getJoinRouteRequest(engagementData);
      expect(save).toBeCalledWith(
        'joinRouteRequestSubmission_slackId', engagementData.submission
      );
      expect(result).toEqual(engagementData.submission);
    });
    it('should get engagement details from JoinRequest model', async () => {
      const engData = { ...engagementData, id: 1, submission: undefined };
      const result = await JoinRouteHelpers.getJoinRouteRequest(engData);
      expect(fetchJoinRequest).toBeCalledWith(1);
      expect(result).toEqual(engagementData.submission);
    });
  });
  describe('engagementFields', () => {
    it('should return a list of slack attachment fields', async () => {
      const payloadData = { ...payload, submission };
      const workHoursSpy = jest.spyOn(Utils, 'formatWorkHours');
      const nameSpy = jest.spyOn(JoinRouteHelpers, 'getName');
      const result = await JoinRouteHelpers.engagementFields(payloadData, null);
      expect(fetchJoinRequest).not.toBeCalled();
      expect(workHoursSpy).toBeCalledWith('18:00-00:00');
      expect(nameSpy).toBeCalledWith('test.user');
      expect(result.length).toEqual(9);
    });
  });
  describe('routeFields', () => {
    it('should return a list of route attachment fields', async () => {
      const route = {
        capacity: '0/4',
        riders: [1, 2],
        takeOff: '00:00',
        route: { name: 'routeName', destination: { address: 'address' } }
      };
      const formatTimeSpy = jest.spyOn(Utils, 'formatTime');
      const result = await JoinRouteHelpers.routeFields(route);
      expect(formatTimeSpy).toBeCalledWith('00:00');
      expect(result.length).toEqual(4);
    });
  });
  describe('joinRouteAttachments', () => {
    it('should return an attachment with JoinRoute details', async () => {
      const payloadData = { ...payload, submission };
      const fieldsOrActionsSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
      const formatTimeSpy = jest.spyOn(Utils, 'formatTime');
      const result = await JoinRouteHelpers.joinRouteAttachments(payloadData);
      expect(fieldsOrActionsSpy).toBeCalledTimes(1);
      expect(formatTimeSpy).toBeCalledWith('00:00');
      expect(result.image_url).toEqual('routeImageUrl');
    });
  });
});
