import ManageTripController from '../ManageTripController';
import slackEvents from '../../events';
import { slackEventNames } from '../../events/slackEvents';
import tripService from '../../../../services/TripService';
import DepartmentService from '../../../../services/DepartmentService';
import TeamDetailsService from '../../../../services/TeamDetailsService';
import { InteractivePrompts } from '../../RouteManagement/rootFile';

jest.mock('../../../../utils/WebClientSingleton');
jest.mock('../../SlackPrompts/InteractivePrompts');
jest.mock('../../events/index.js');
jest.mock('../../../../services/TeamDetailsService');


afterAll(() => {
  jest.restoreAllMocks();
});

describe('Manage trip controller run validations', () => {
  it('should be able to run validations on empty string', (done) => {
    const res = ManageTripController.runValidation({ declineReason: '        ' });
    expect(res).toEqual([{ name: 'declineReason', error: 'This field cannot be empty' }]);
    done();
  });

  it('should be able to run validations on very long strings', (done) => {
    const res = ManageTripController.runValidation({
      declineReason: `
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxv
    `
    });
    expect(res).toEqual([
      { name: 'declineReason', error: 'Character length must be less than or equal to 100' }
    ]);
    done();
  });
});

describe('Manage Trip Controller decline trip', () => {
  beforeEach(() => {
    jest.spyOn(slackEvents, 'raise').mockReturnValue();
    jest.spyOn(tripService, 'getById')
      .mockImplementation(id => Promise.resolve({ id, name: 'Test Trip' }));
    jest.spyOn(DepartmentService, 'getHeadByDeptId')
      .mockResolvedValue({ slackId: 'U123S0' });
    jest.spyOn(TeamDetailsService, 'getTeamDetailsBotOauthToken').mockResolvedValue('token');
    jest.spyOn(InteractivePrompts, 'sendManagerDeclineOrApprovalCompletion').mockReturnValue();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should return an error on decline trip request', async () => {
    jest.spyOn(tripService, 'getById').mockRejectedValue();
    const res = jest.fn();

    try {
      await ManageTripController.declineTrip(['timestamp', 'XXXXXXX', 1000],
        'No reason at all', res);
    } catch (err) {
      expect(res).toBeCalledWith({
        text: 'Dang, something went wrong there.'
      });
    }
  });

  it('should decline trip request', async (done) => {
    await ManageTripController.declineTrip(['timestamp', 'XXXXXXX', 3],
      'No reason at all', jest.fn());

    expect(slackEvents.raise).toHaveBeenCalledWith(
      slackEventNames.DECLINED_TRIP_REQUEST,
      expect.any(Object), expect.any(Function),
      expect.any(String)
    );

    done();
  });
});
