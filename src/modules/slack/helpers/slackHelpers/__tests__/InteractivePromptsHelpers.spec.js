import InteractivePromptsHelpers from '../InteractivePromptsHelpers';

describe('InteractivePromptsHelpers', () => {
  it('should generate trip fields', (done) => {
    const tripInfo = {
      requester: {
        dataValues: {
          slackId: 'XXXXXXXX'
        }
      },
      department: {
        dataValues: {
          name: 'people'
        }
      },
      rider: {
        dataValues: {
          slackId: 'XXXXXXXXX'
        }
      },
      origin: {
        dataValues: {
          address: 'Lagos'
        }
      },
      destination: {
        dataValues: {
          address: 'Abuja'
        }
      }
    };

    const res = InteractivePromptsHelpers.addOpsNotificationTripFields(tripInfo);

    expect(res.length).toBe(7);
    done();
  });

  it('should generate cab fields', (done) => {
    const cabInfo = {
      driverName: 'Dave',
      driverPhoneNo: '456789',
      regNumber: 'AG 915 LAR'
    };

    const res = InteractivePromptsHelpers.addOpsNotificationCabFields(cabInfo);
    expect(res.length).toBe(3);
    done();
  });
});
