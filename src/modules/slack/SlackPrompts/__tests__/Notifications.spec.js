import Notifications from '../Notifications';

jest.mock('../../../../utils/WebClientSingleton');

describe('Notifications', () => {
  it('should fail when departmentId is wrong', async (done) => {
    const tripInfo = {
      departmentId: 100,
      requestedById: 100,
      id: 100
    };

    await Notifications.sendManagerTripRequestNotification(tripInfo, (response) => {
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

    const res = await Notifications.sendManagerTripRequestNotification(tripInfo, () => {});
    expect(res).toEqual({
      data: 'successfully opened chat'
    });
    done();
  });

  it('should send notification', async (done) => {
    const res = await Notifications.sendNotification(
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
    Notifications.sendRequesterDeclinedNotification(tripInfo, (res) => {
      expect(res).toEqual({
        text: 'Error:warning:: Decline saved but requester will not get the notification'
      });
    });
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
    const res = await Notifications.sendRequesterDeclinedNotification(
      tripInfo,
      () => {}
    );

    expect(res).toEqual({
      data: 'successfully opened chat'
    });
    done();
  });
});
