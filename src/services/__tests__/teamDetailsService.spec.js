import TeamDetailsService from '../TeamDetailsService';
import database from '../../database';
import cache from '../../cache';

const { models: { TeamDetails } } = database;

describe('Team details service', () => {
  beforeAll(() => {
    cache.saveObject = jest.fn(() => { });
    cache.fetch = jest.fn((teamId) => {
      if (teamId === 'teamDetails_SAVEDTEAMID') {
        return {
          data: 'team details'
        };
      }
    });
  });

  it('should get team details from cache', async () => {
    const teamDetails = await TeamDetailsService.getTeamDetails('SAVEDTEAMID');

    expect(teamDetails).toEqual({
      data: 'team details'
    });
  });

  it('should fetch team details from DB', async (done) => {
    jest.spyOn(TeamDetails, 'findByPk').mockReturnValue({ teamId: 'TEAMID1', teamName: 'Team 1' });
    const teamDetails = await TeamDetailsService.getTeamDetails('TEAMID1');

    expect(teamDetails.teamId).toEqual('TEAMID1');
    expect(teamDetails.teamName).toEqual('Team 1');
    expect(cache.saveObject.mock.calls.length).toEqual(1);
    done();
  });

  it('should throw a db error', async () => {
    try {
      await TeamDetailsService.getTeamDetails({});
    } catch (error) {
      expect(error.message).toBe('Could not get team details from DB');
    }
  });

  it('should save new team details', async () => {
    const result = await TeamDetailsService.saveTeamDetails({
      botId: 'XXXXXXX',
      botToken: 'XXXXXXXXXXXXX',
      teamId: 'XXXXXXX',
      teamName: 'Fake Team',
      userId: 'XXXXXXXXXXXXX',
      userToken: 'XXXXXXXXXXX',
      webhookConfigUrl: 'XXXXXXXXXXXXX',
      opsChannelId: 'XXXXXXXXXXXXX',
      teamUrl: 'faketeam.slack.come'
    });

    expect(result).toEqual({
      botId: 'XXXXXXX',
      botToken: 'XXXXXXXXXXXXX',
      teamId: 'XXXXXXX',
      teamName: 'Fake Team',
      userId: 'XXXXXXXXXXXXX',
      userToken: 'XXXXXXXXXXX',
      webhookConfigUrl: 'XXXXXXXXXXXXX',
      opsChannelId: 'XXXXXXXXXXXXX',
      teamUrl: 'faketeam.slack.come'
    });
  });

  it('should throw an error on team details', async () => {
    try {
      await TeamDetailsService.saveTeamDetails();
    } catch (error) {
      expect(error.message).toEqual('Could not update teamDetails or write new teamDetails to DB');
    }
  });

  describe('TeamDetailsService_getAllTeams', () => {
    beforeEach(() => {
      jest.spyOn(TeamDetails, 'findAll').mockImplementation().mockResolvedValue([{
        teamId: 'TEAMID2',
        botId: 'BOTID2',
        botToken: 'BOTTOKEN2',
        teamName: 'TEAMNAME2',
        teamUrl: 'https://ACME.slack.com'
      }]);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should fetch all team details from DB', async () => {
      const allTeams = await TeamDetailsService.getAllTeams();

      expect(TeamDetails.findAll).toBeCalled();
      expect(allTeams[0].teamId).toEqual('TEAMID2');
      expect(allTeams).not.toBeNaN();
    });

    it('should throw an error when it cannot get team details', async () => {
      jest.spyOn(TeamDetails, 'findAll').mockImplementation(() => {
        throw new Error();
      });
      try {
        await TeamDetailsService.getAllTeams();
      } catch (error) {
        expect(error.message).toEqual('Could not get all teamDetails from DB');
      }
    });
  });
});

describe('getTeamDetailsByTeamUrl', () => {
  const teamUrl = 'teamUrl';
  const data = { data: 'team details' };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch team details from catch', async () => {
    cache.fetch = jest.fn((teamId) => ((teamId === `teamDetails_${teamUrl}`) ? data : null));
    TeamDetails.findOne = jest.fn(() => data);

    const result = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    expect(TeamDetails.findOne).not.toHaveBeenCalled();
    expect(cache.fetch).toBeCalledTimes(1);
    expect(result).toEqual(data);
  });

  it('should fetch team details from database and save it in cache', async () => {
    cache.fetch = jest.fn(() => null);
    TeamDetails.findOne = jest.fn(() => data);
    cache.saveObject = jest.fn(() => { });

    const result = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    expect(cache.fetch).toBeCalledTimes(1);
    expect(TeamDetails.findOne).toBeCalledTimes(1);
    expect(cache.saveObject).toBeCalledWith(`teamDetails_${teamUrl}`, data);
    expect(result).toEqual(data);
  });

  it('should fail on get team details by URL', async () => {
    cache.fetch = jest.fn(() => null);
    TeamDetails.findOne = jest.fn(() => Promise.reject(new Error('')));

    try {
      await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
      expect(cache.fetch).toBeCalledTimes(1);
    } catch (error) {
      expect(error.message).toEqual('Could not get the team details.');
    }
  });
});
