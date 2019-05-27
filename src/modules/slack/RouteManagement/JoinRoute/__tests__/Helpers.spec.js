import JoinRouteHelpers from '../JoinRouteHelpers';
import Cache from '../../../../../cache';
import PartnerService from '../../../../../services/PartnerService';
import { SlackHelpers } from '../../rootFile';
import JoinRouteRequestService from '../../../../../services/JoinRouteRequestService';
import RouteService from '../../../../../services/RouteService';
import Utils from '../../../../../utils/index';
import { SlackAttachment } from '../../../SlackModels/SlackMessageModels';
import AttachmentHelper from '../../../SlackPrompts/notifications/AttachmentHelper';

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
  const { partnerName: name, ...engagementDetails } = submission;
  const joinRequestMock = {
    manager: { email: 'AAA.BBB@CCC.DDD', name: 'ZZZZZZ', slackId: 'managerId' },
    routeBatch: routeData,
    engagement: {
      ...engagementDetails,
      partner: { name },
      fellow: { email: 'AAA.BBB@CCC.DDD', name: 'ZZZZZZ', slackId: 'PPPPPP' }
    }
  };
  let routeBatch;
  let fetch;
  let saveObject;
  let partner;
  let engagement;
  let fellow;
  let manager;
  let joinRequest;
  let fetchJoinRequest;
  beforeEach(() => {
    routeBatch = jest.spyOn(RouteService, 'getRouteBatchByPk')
      .mockReturnValue(routeData);
    fetch = jest.spyOn(Cache, 'fetch').mockResolvedValue({
      manager: 'manager',
      partnerName: 'partner',
      workHours: 'workHours',
      startDate: 'startDate',
      endDate: 'endDate'
    });
    saveObject = jest.spyOn(Cache, 'saveObject').mockImplementation(jest.fn());
    partner = jest.spyOn(PartnerService, 'findOrCreatePartner').mockResolvedValue(data);
    engagement = jest.spyOn(PartnerService, 'findOrCreateEngagement').mockResolvedValue(data);
    fellow = jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockResolvedValue(data);
    manager = jest.spyOn(SlackHelpers, 'findOrCreateUserBySlackId').mockResolvedValue(data);
    joinRequest = jest.spyOn(JoinRouteRequestService, 'createJoinRouteRequest')
      .mockResolvedValue({ id: 1 });
    fetchJoinRequest = jest.spyOn(JoinRouteRequestService, 'getJoinRouteRequest')
      .mockResolvedValue(joinRequestMock);
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
  describe('saveJoinRouteRequest', () => {
    it('should save join route request', async () => {
      const result = await JoinRouteHelpers.saveJoinRouteRequest(payload, '1');
      expect(fetch).toBeCalledWith('joinRouteRequestSubmission_slackId');
      expect(partner).toBeCalledWith('partner');
      expect(fellow).toBeCalledWith('slackId', 'teamId');
      expect(engagement).toBeCalled();
      expect(manager).toBeCalledWith('manager');
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
      expect(saveObject).toBeCalledWith(
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
      const nameSpy = jest.spyOn(AttachmentHelper, 'engagementAttachmentFields');
      const result = await JoinRouteHelpers.engagementFields(joinRequestMock, null);
      expect(result).toBeInstanceOf(Array);
      expect(nameSpy).toHaveBeenCalledWith(joinRequestMock);
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
      const result = JoinRouteHelpers.routeFields(route);
      expect(result.length).toEqual(4);
    });
  });
  describe('joinRouteAttachments', () => {
    it('should return an attachment with JoinRoute details', async () => {
      const fieldsOrActionsSpy = jest.spyOn(SlackAttachment.prototype, 'addFieldsOrActions');
      const formatTimeSpy = jest.spyOn(Utils, 'formatTime');
      const result = await JoinRouteHelpers.joinRouteAttachments(joinRequestMock);
      expect(fieldsOrActionsSpy).toBeCalledTimes(1);
      expect(formatTimeSpy).toBeCalledWith('00:00');
      expect(result.image_url).toEqual('routeImageUrl');
    });
  });
});
