import NotificationsResponse from '../NotificationsResponse';
import SlackHelpers from '../../../../helpers/slack/slackHelpers';
import * as SlackModels from '../../SlackModels/SlackMessageModels';
import responseData from '../__mocks__/NotificationResponseMock';
import HomebaseService from '../../../../services/HomebaseService';

describe('Notifications Response Test', () => {
  beforeEach(() => {
    jest.spyOn(HomebaseService, 'getHomeBaseBySlackId').mockResolvedValue(1);
  });

  it('should test response for operations channel for regular trip', async () => {
    const payload = { user: { id: '332' } };
    const result = await NotificationsResponse.getRequestMessageForOperationsChannel(
      responseData, payload, 'hello', 'regular'
    );
    expect(result).toHaveProperty('attachments');
  });

  it('should test response for operations channel for travel trip', async () => {
    const payload = { user: { id: '332' } };
    const result = await NotificationsResponse.getRequestMessageForOperationsChannel(
      responseData, payload, 'hello', 'travel'
    );
    expect(result).toHaveProperty('attachments');
  });

  it('should test travelOperations response', () => {
    const result = NotificationsResponse.travelOperationsDepartmentResponse(
      '212', responseData, 'blue', '', 'call'
    );
    expect(result).toHaveProperty('attachments');
  });

  it('should test OperationsDepartment response', () => {
    const payload = { user: { id: '332' } };
    const result = NotificationsResponse.prepareOperationsDepartmentResponse(
      '212', responseData, 'blue', '', 'call', payload
    );
    expect(result).toHaveProperty('attachments');
  });

  it('should create get requester Attachment', () => {
    const payload = {
      department: 'dept',
      data: 'data',
      slackChannelId: 'slack',
      pickup: {
        address: 'pick',
      },
      destination: {
        address: 'dest',
      },
      requestDate: '11/12/2018 11:00',
      departureDate: '21/12/2018 11:00',
      tripStatus: 'trip',
      managerComment: 'manager'
    };
    const {
      department, data, slackChannelId, pickup, destination,
      requestDate, departureDate, tripStatus, managerComment
    } = payload;
    const result = NotificationsResponse.getRequesterAttachment(
      department, data, slackChannelId, pickup, destination,
      requestDate, departureDate, tripStatus, managerComment
    );
    expect(result[0]).toHaveProperty('actions');
    expect(result[0]).toHaveProperty('attachment_type');
  });

  it('should create notification header', async () => {
    const isApproved = { approvedBy: 'testUser' };
    const trip = {
      pickup: { address: 'testAddress' },
      destination: { address: 'testAddress' }
    };
    const messageHeader = `Your request from *${trip.pickup.address}* to *${trip.destination.address
      }* has been approved by ${isApproved.approvedBy
      }. The request has now been forwarded to the operations team for confirmation.`;

    SlackHelpers.isRequestApproved = jest.fn(() => isApproved);
    const result = await NotificationsResponse.getMessageHeader(trip);

    expect(result).toEqual(messageHeader);
  });

  it('should create interactive message for sending a response to requester with color as "good"', async () => {
    jest.mock('../../SlackModels/SlackMessageModels');
    const objectFromNewInstance = { someProp: 'someValue' };
    SlackModels.SlackAttachment = jest.fn(() => objectFromNewInstance);
    SlackModels.SlackInteractiveMessage = jest.fn(() => objectFromNewInstance);
    NotificationsResponse.getMessageHeader = jest.fn().mockResolvedValue();
    NotificationsResponse.getRequesterAttachment = jest.fn().mockReturnValue([{}]);
    const data = { tripStatus: 'cancel' };

    const result = await NotificationsResponse.responseForRequester(data);

    expect(result).toEqual(objectFromNewInstance);
  });

  it('should create interactive message for sending a response to requester with color as "undefined"', async () => {
    jest.mock('../../SlackModels/SlackMessageModels');
    const objectFromNewInstance = { someProp: 'someValue' };
    SlackModels.SlackAttachment = jest.fn(() => objectFromNewInstance);
    SlackModels.SlackInteractiveMessage = jest.fn(() => objectFromNewInstance);
    NotificationsResponse.getMessageHeader = jest.fn().mockResolvedValue();
    NotificationsResponse.getRequesterAttachment = jest.fn().mockReturnValue([{}]);
    const data = {};

    const result = await NotificationsResponse.responseForRequester(data);

    expect(result).toEqual(objectFromNewInstance);
  });
});
