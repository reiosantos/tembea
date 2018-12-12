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


  it('should format trip history', () => {
    const tripHistory = [
      {
        departureTime: '22:00 12/12/2018',
        'origin.address': 'ET',
        'destination.address': 'DOJO'
      }
    ];
    const result = InteractivePromptsHelpers.formatTripHistory(tripHistory);
    expect(result[0]).toHaveProperty('actions');
    expect(result[0]).toHaveProperty('fields');
  });

  it('should generate preview trip response', () => {
    const tripDetails = {
      rider: 'ride',
      dateTime: 'tim',
      flightDateTime: 'fly',
      pickup: 'pi',
      destination: 'dest',
      noOfPassengers: 'num',
      riderPhoneNo: 'ri',
      travelTeamPhoneNo: 'travel',
      tripType: 'trip',
      departmentName: 'depart'
    };
    const result = InteractivePromptsHelpers.generatePreviewTripResponse(tripDetails);
    expect(result).toHaveProperty('attachments');
  });
});
