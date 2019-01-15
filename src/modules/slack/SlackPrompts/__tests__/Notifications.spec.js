import sinon from 'sinon';
import SlackInteractions from '../../SlackInteractions';
import SlackNotifications from '../Notifications';
import DialogPrompts from '../DialogPrompts';

import models from '../../../../database/models';
import { SlackEvents } from '../../events/slackEvents';

SlackEvents.raise = jest.fn();

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../../../services/TeamDetailsService', () => ({
  getTeamDetails: jest.fn(() => Promise.resolve({
    botToken: 'just a token',
    webhookConfigUrl: 'just a url'
  })),
  getTeamDetailsBotOauthToken: jest.fn(() => Promise.resolve('just a random token'))
}));

describe('SlackNotifications', () => {
  it('should fail when departmentId is wrong', async (done) => {
    const tripInfo = {
      departmentId: 100,
      requestedById: 100,
      id: 100
    };
    const payload = {
      team: { id: 'HAHJDILYR' }
    };

    await SlackNotifications.sendManagerTripRequestNotification(payload, tripInfo, (response) => {
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
      id: 3,
    };
    const payload = {
      team: { id: 'HAHJDILYR' }
    };

    const res = await SlackNotifications.sendManagerTripRequestNotification(
      payload, tripInfo, () => {}
    );
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
      },
      cab: {
        dataValues: {
          driverName: 'Sunday',
          driverPhoneNo: '001001001',
          regNumber: '1928dfsgg'
        }
      }
    };
    const payload = {
      user: { id: 3 },
      team: { id: 'HAHJDILYR' }
    };
    const delineStatus = false;
    const res = await SlackNotifications.sendManagerConfirmOrDeclineNotification(
      payload, tripInfo, delineStatus
    );
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
      },
      cab: {
        dataValues: {
          driverName: 'Dave',
          driverPhoneNo: '6789009876',
          regNumber: 'JK 321 LG'
        }
      }
    };

    const payload = {
      user: { id: 3 },
      team: { id: 'HAHJDILYR' },
      submission: {
        driverName: 'driverName', driverPhoneNo: 'driverPhoneNo', regNumber: 'regNumber'
      }
    };
    const delineStatus = true;
    const res = await SlackNotifications.sendManagerConfirmOrDeclineNotification(
      payload, tripInfo, delineStatus
    );
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
      },
      cab: {
        dataValues: {
          driverName: 'Dave',
          driverPhoneNo: '6789009876',
          regNumber: 'JK 321 LG'
        }
      }
    };
    const declineStatusFalse = false;
    const declineStatusTrue = true;
    const payload = {
      user: { id: 3 },
      team: { id: 'HAHJDILYR' },
      submission: {
        driverName: 'driverName', driverPhoneNo: 'driverPhoneNo', regNumber: 'regNumber'
      }
    };
    it('should send user notification when requester is equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 3;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(payload, tripInfo, declineStatusFalse);
      expect(res).toEqual(undefined);
    });

    it('should send user notification when requester is not equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 4;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(payload, tripInfo, declineStatusFalse);
      expect(res).toEqual(undefined);
    });

    it('should send user confirmation notification when requester is equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 3;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(payload, tripInfo, declineStatusTrue);
      expect(res).toEqual(undefined);
    });

    it('should send user confirmation notification when requester is not equal to rider', async () => {
      tripInfo.rider.dataValues.slackId = 4;
      const res = await SlackNotifications.sendUserConfirmOrDeclineNotification(payload, tripInfo, declineStatusTrue);
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

  it('should notify ops on manager\'s approval', async (done) => {
    const payload = {
      team: { id: 'AHDJDLKUER' }
    };
    await SlackNotifications.sendOperationsTripRequestNotification(23, payload, respond);
    expect(SlackEvents.raise).toBeCalled();
    done();
  });

  it('should throw an error when accessing dataValues form non existing dept', async (done) => {
    const payload = {
      team: { id: 'AHDJDLKUER' }
    };
    deptFindByPkStub.returns(Promise.resolve({}));
    const manager = await SlackNotifications.sendOperationsTripRequestNotification(undefined, payload, respond);
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
    const approveTripRequestByManager = jest.spyOn(SlackInteractions, 'approveTripRequestByManager')
      .mockImplementationOnce(() => {});
    const payload = {
      actions: [{ name: 'manager_approve' }],
      user: {},
      submission: {}
    };

    tripFindByPkStub.returns(Promise.resolve({ dataValues: tripInitial }));
    const manager = await SlackInteractions.handleManagerActions(payload, jest.fn);
    expect(approveTripRequestByManager).toHaveBeenCalledTimes(1);
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
      submission: {},
      original_message: {
        ts: '1345654321.43212345432'
      },
      channel: {
        id: 'YU789098765'
      }
    };
    DialogPrompts.sendDialogToManager = jest.fn(() => {});
    tripFindByPkStub.returns(Promise.resolve({ dataValues: tripInitial, update: jest.fn }));
    const manager = await SlackInteractions.handleManagerApprovalDetails(payload, jest.fn);
    expect(manager).toEqual(undefined);
    SlackInteractions.approveTripRequestByManager(payload, {}, { isApproved: true }, jest.fn);
    expect(DialogPrompts.sendDialogToManager.mock.calls.length).toBe(1);
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
