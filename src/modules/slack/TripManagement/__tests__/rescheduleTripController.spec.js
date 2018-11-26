import RescheduleTripController from '../RescheduleTripController';

jest.mock('../../../../utils/WebClientSingleton');

describe('RescheduleTripController', () => {
  it('should get user information', async (done) => {
    const userInfo = await RescheduleTripController.getUserInfo();

    expect(userInfo).toEqual({ tz_offset: 3600 });
    done();
  });

  it('should run validations with invalid date error', async (done) => {
    const nextYear = new Date().getFullYear() + 1;
    
    const errors = await RescheduleTripController.runValidations(`8/1/${nextYear} 12;00`, { id: 1 });

    expect(errors.length).toBe(1);
    expect(errors[0]).toEqual({
      name: 'time',
      error: 'The time should be in the 24 hours format hh:mm'
    });
    done();
  });

  it('should run validations with past date error', async (done) => {
    const errors = await RescheduleTripController.runValidations('8/1/2018 12:00', { id: 1 });

    expect(errors.length).toBe(3);
    expect(errors[0]).toEqual({
      name: 'newMonth',
      error: 'This date seems to be in the past!'
    }, {
      name: 'newDate',
      error: 'This date seems to be in the past!'
    }, {
      name: 'time',
      error: 'This date seems to be in the past!'
    });
    done();
  });
});
