import sinon from 'sinon';
import SlackInteractions from '../../SlackInteractions';
import SlackNotifications from '../Notifications';

import models from '../../../../database/models';

jest.mock('../../../../utils/WebClientSingleton');

describe('SlackNotifications', () => {
  it('should fail when departmentId is wrong', async (done) => {
    const tripInfo = {
      departmentId: 100,
      requestedById: 100,
      id: 100
    };

    await SlackNotifications.sendManagerTripRequestNotification(tripInfo, (response) => {
      expect(response).toEqual({
        text: 'Error:warning:: Request saved, but I could not send a notification to your manager.'
      });
    });
    done();
  });

  it('should send the manager a notification', async (done) => {
    const tripInfo = {
      departmentId: 3,
      requestedById: 6,
      id: 3
    };

    const res = await SlackNotifications.sendManagerTripRequestNotification(tripInfo, () => {});
    expect(res).toEqual({
      data: 'successfully opened chat'
    });
    done();
  });

  it('should send notification', async (done) => {
    const res = await SlackNotifications.sendNotification(
      { channel: { id: 'XXXXXX' } },
      {},
      'some text'
    );

    expect(res).toEqual({
      data: 'successfully opened chat'
    });
    done();
  });

  it('should send error on decline', async (done) => {
    const { User } = models;

    const userFindByPkStub = sinon.stub(User, 'findOne');
    userFindByPkStub.rejects();

    const tripInfo = {
      departmentId: 6,
      requestedById: 1000,
      declinedById: 6,
      origin: {
        dataValues: {
          address: 'Someplace'
        }
      },
      destination: {
        dataValues: {
          address: 'Someplace'
        }
      },
      id: 3
    };
    const response = jest.fn();
    const responseData = {
      text: 'Error:warning:: Decline saved but requester will not get the notification'
    };
    await SlackNotifications.sendRequesterDeclinedNotification(tripInfo, response);
    expect(response).toBeCalledWith(responseData);
    userFindByPkStub.restore();
    done();
  });

  it('should send decline notification', async (done) => {
    const tripInfo = {
      departmentId: 6,
      requestedById: 6,
      declinedById: 6,
      origin: {
        dataValues: {
          address: 'Someplace'
        }
      },
      destination: {
        dataValues: {
          address: 'Someplace'
        }
      },
      id: 3
    };
    SlackNotifications.getDMChannelId = () => (jest.fn(() => (123)));
    const res = await SlackNotifications.sendRequesterDeclinedNotification(
      tripInfo,
      () => {}
    );

    expect(res).toEqual({
      data: 'successfully opened chat'
    });
    done();
  });

  it('should send manager notification', async () => {
    const tripInfo = {
      department: {
        dataValues: {
          headId: 3,
        }
      },
      rider: {
        dataValues: {
          slackId: 3,
        }
      },
      origin: {
        dataValues: {
          address: 'never land',
        }
      },
      destination: {
        dataValues: {
          address: 'never land',
        }
      }
    };
    const payload = {
      user: { id: 3 }
    };
    const res = await SlackNotifications.sendManagerNotification(payload, tripInfo);
    expect(res).toEqual(undefined);
  });

  it('should send manager confirmation notification', async () => {
    const tripInfo = {
      department: {
        dataValues: {
          headId: 3,
        }
      },
      rider: {
        dataValues: {
          slackId: 3,
        }
      },
      origin: {
        dataValues: {
          address: 'never land',
        }
      },
      destination: {
        dataValues: {
          address: 'never land',
        }
      }
    };
    const payload = {
      user: { id: 3 },
      submission: { driverName: 'driverName', driverPhoneNo: 'driverPhoneNo', regNumber: 'regNumber' }
    };
    const res = await SlackNotifications.sendManagerConfirmNotification(payload, tripInfo);
    expect(res).toEqual(undefined);
  });

  describe('User Notification', () => {
    const tripInfo = {
      requester: {
        dataValues: {
          slackId: 3,
        }
      },
      rider: {
        dataValues: {
          slackId: 3,
        }
      },
      origin: {
        dataValues: {
          address: 'never land',
        }
      },
      destination: {
        dataValues: {
          address: 'never land',
        }
      }
    };
    const payload = {
      user: { id: 3 },
      submission: { driverName: 'driverName', driverPhoneNo: 'driverPhoneNo', regNumber: 'regNumber' }
    };
    it('should send user notification when requester is equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 3;
      const res = await SlackNotifications.sendUserNotification(payload, tripInfo);
      expect(res).toEqual(undefined);
    });

    it('should send user notification when requester is not equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 4;
      const res = await SlackNotifications.sendUserNotification(payload, tripInfo);
      expect(res).toEqual(undefined);
    });

    it('should send user confirmation notification when requester is equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 3;
      const res = await SlackNotifications.sendUserConfirmNotification(payload, tripInfo);
      expect(res).toEqual(undefined);
    });

    it('should send user confirmation notification when requester is not equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 4;
      const res = await SlackNotifications.sendUserConfirmNotification(payload, tripInfo);
      expect(res).toEqual(undefined);
    });
  });
});

describe('SlackNotifications Tests: Manager approval', () => {
  const { TripRequest, User, Department } = models;

  let sandbox;
  let tripFindByPkStub;
  let userFindByPkStub;
  let deptFindByPkStub;

  const tripInitial = {
    id: 2,
    requestId: null,
    departmentId: 23,
    tripStatus: 'Approved',
    department: null,
    destination: { dataValues: {} },
    origin: { dataValues: {} },
    pickup: { },
    departureDate: null,
    requestDate: new Date(),
    requester: { dataValues: {} },
    rider: { dataValues: { slackId: 2 } },
  };

  let respond;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    tripFindByPkStub = sandbox.stub(TripRequest, 'findByPk');
    userFindByPkStub = sandbox.stub(User, 'findOne');
    deptFindByPkStub = sandbox.stub(Department, 'findByPk');
    respond = jest.fn(value => value);
    tripFindByPkStub.returns(Promise.resolve({ dataValues: tripInitial }));
    userFindByPkStub.returns(Promise.resolve({ dataValues: { id: 45 } }));
    deptFindByPkStub.returns(Promise.resolve({ dataValues: { head: { dataValues: {} } } }));
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should notify manager of new trip request', async (done) => {
    const manager = await SlackNotifications.sendOperationsTripRequestNotification(23, 'payload', respond);
    expect(manager).toEqual(undefined);
    done();
  });

  it('should throw an error when accessing dataValues form non existing dept', async (done) => {
    deptFindByPkStub.returns(Promise.resolve({}));
    const manager = await SlackNotifications.sendOperationsTripRequestNotification(undefined, 'payload', respond);
    expect(manager).toEqual(undefined);
    done();
  });

  it('should throw error when trying to notify rider', async (done) => {
    deptFindByPkStub.returns(Promise.resolve());
    const manager = await SlackNotifications.sendRequesterApprovedNotification(
      tripInitial, jest.fn
    );
    expect(manager).toEqual(undefined);
    done();
  });

  it('should throw error when trying to access requester slackId', async (done) => {
    const manager = await SlackNotifications.sendRequesterApprovedNotification(
      tripInitial, jest.fn
    );
    expect(manager).toEqual(undefined);
    done();
  });

  it('should only notify rider', async (done) => {
    const manager = await SlackNotifications.sendRequesterApprovedNotification(
      { ...tripInitial, requester: { slackId: 2 } }, jest.fn
    );
    expect(manager).toEqual(undefined);
    done();
  });

  it('Handle manager approve request', async (done) => {
    const payload = {
      actions: [{ name: 'manager_approve' }],
      user: {},
      submission: {}
    };

    tripFindByPkStub.returns(Promise.resolve({ dataValues: tripInitial }));
    const manager = await SlackInteractions.handleManagerActions(payload, jest.fn);
    expect(manager).toEqual(undefined);

    await SlackInteractions.handleManagerActions({ actions: [{ name: 'm' }] }, jest.fn());
    done();
  });

  it('Handle manager approve details request and throw an error', async (done) => {
    const payload = {
      actions: [{ name: 'manager_approve' }],
      user: {},
      submission: {}
    };
    tripFindByPkStub.returns(Promise.resolve({ dataValues: tripInitial }));
    const manager = await SlackInteractions.handleManagerApprovalDetails(payload, jest.fn);
    expect(manager).toEqual(undefined);
    done();
  });

  it('Handle manager approve details request', async (done) => {
    const payload = {
      actions: [{ name: 'manager_approve' }],
      user: {},
      submission: {}
    };
    tripFindByPkStub.returns(Promise.resolve({ dataValues: tripInitial, update: jest.fn }));
    const manager = await SlackInteractions.handleManagerApprovalDetails(payload, jest.fn);
    expect(manager).toEqual(undefined);
    expect(
      SlackInteractions.approveTripRequestByManager({}, {}, { isApproved: true }, jest.fn)
    ).toBeUndefined();
    done();
  });

  it('Handle manager approve details request but fail to approve', async (done) => {
    const payload = {
      actions: [{ name: 'manager_approve' }],
      user: {},
      submission: {}
    };
    tripFindByPkStub.returns(Promise.resolve());
    const manager = await SlackInteractions.handleManagerApprovalDetails(payload, jest.fn);
    expect(manager).toEqual(undefined);
    done();
  });
});
