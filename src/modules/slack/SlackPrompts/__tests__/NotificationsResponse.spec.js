import NotificationsResponse from '../NotificationsResponse';
import responseData from '../__mocks__/NotificationResponseMock';

describe('Notifications Response Test', () => {
  it('should test response for operations channel for regular trip', () => {
    const payload = { user: { id: '332' } };
    const result = NotificationsResponse.getRequestMessageForOperationsChannel(
      responseData, payload, 'hello', 'regular'
    );
    expect(result).toHaveProperty('attachments');
  });

  it('should test response for operations channel for travel trip', () => {
    const payload = { user: { id: '332' } };
    const result = NotificationsResponse.getRequestMessageForOperationsChannel(
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
});
