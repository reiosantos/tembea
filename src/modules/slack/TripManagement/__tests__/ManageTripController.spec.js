import ManageTripController from '../ManageTripController';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../SlackPrompts/InteractivePrompts');
jest.mock('../../events/index.js');
jest.mock('../../../../services/TeamDetailsService');


afterAll(() => {
  jest.restoreAllMocks();
});

describe('Manage trip controller run validations', () => {
  it('should be able to run validations on empty string', (done) => {
    const res = ManageTripController.runValidation('        ');
    expect(res).toEqual([{ name: 'declineReason', error: 'This field cannot be empty' }]);
    done();
  });

  it('should be able to run validations on very long strings', (done) => {
    const res = ManageTripController.runValidation(`
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxv
    `);
    expect(res).toEqual([
      { name: 'declineReason', error: 'Character length must be less than or equal to 100' }
    ]);
    done();
  });
});

describe('Manage Trip Controller decline trip', () => {
  it('should return an error on decline trip request', async () => {
    await ManageTripController.declineTrip(['timestamp', 'XXXXXXX', 1000],
      'No reason at all',
      (res) => {
        expect(res).toEqual({
          text: 'Dang, something went wrong there.'
        });
      });
  });

  it('should decline trip request', async (done) => {
    await ManageTripController.declineTrip(['timestamp', 'XXXXXXX', 3],
      'No reason at all',
      (response) => {
        expect(response).toEqual({
          data: 'Notification sent'
        });
        done();
      });
  });
});
