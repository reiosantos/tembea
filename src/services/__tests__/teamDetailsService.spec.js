import TeamDetailsService from '../TeamDetailsService';
import models from '../../database/models';
import cache from '../../cache';

const { TeamDetails } = models;

describe('Team details service', () => {
  beforeAll(() => {
    cache.saveObject = jest.fn(() => {});
    cache.fetch = jest.fn((teamId) => {
      if (teamId === 'teamDetails_SAVEDTEAMID') {
        return {
          data: 'team details'
        };
      }
    });
  });

  it('should get team details from cache', async (done) => {
    const teamDetails = await TeamDetailsService.getTeamDetails('SAVEDTEAMID');

    expect(teamDetails).toEqual({
      data: 'team details'
    });
    done();
  });

  it('should fetch team details from DB', async (done) => {
    const teamDetails = await TeamDetailsService.getTeamDetails('TEAMID1');

    expect(teamDetails.teamId).toEqual('TEAMID1');
    expect(teamDetails.teamName).toEqual('Team 1');
    expect(cache.saveObject.mock.calls.length).toEqual(1);
    done();
  });

  it('should throw a db error', async (done) => {
    try {
      await TeamDetailsService.getTeamDetails({});
    } catch (error) {
      expect(error.message).toBe('Could not get team details from DB');
      done();
    }
  });

  it('should save new team details', async (done) => {
    const result = await TeamDetailsService.saveTeamDetails({
      botId: 'XXXXXXX',
      botToken: 'XXXXXXXXXXXXX',
      teamId: 'XXXXXXX',
      teamName: 'Fake Team',
      userId: 'XXXXXXXXXXXXX',
      userToken: 'XXXXXXXXXXX',
      webhookConfigUrl: 'XXXXXXXXXXXXX',
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
      teamUrl: 'faketeam.slack.come'
    });
    done();
  });

  it('should throw an error on team details', async (done) => {
    try {
      await TeamDetailsService.saveTeamDetails();
    } catch (error) {
      expect(error.message).toEqual('Could not update teamDetails or write new teamDetails to DB');
      done();
    }
  });
});

describe('getTeamDetailsByTeamUrl', () => {
  const teamUrl = 'teamUrl';
  const data = { data: 'team details' };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch team details from catch', async () => {
    cache.fetch = jest.fn(teamId => ((teamId === `teamDetails_${teamUrl}`) ? data : null));
    TeamDetails.findOne = jest.fn(() => data);

    const result = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    expect(TeamDetails.findOne).not.toHaveBeenCalled();
    expect(cache.fetch).toBeCalledTimes(1);
    expect(result).toEqual(data);
  });

  it('should fetch team details from database and save it in cache', async () => {
    cache.fetch = jest.fn(() => null);
    TeamDetails.findOne = jest.fn(() => data);
    cache.saveObject = jest.fn(() => {});

    const result = await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
    expect(cache.fetch).toBeCalledTimes(1);
    expect(TeamDetails.findOne).toBeCalledTimes(1);
    expect(cache.saveObject).toBeCalledWith(`teamDetails_${teamUrl}`, data);
    expect(result).toEqual(data);
  });

  it('should fail on get team details by URL', async (done) => {
    cache.fetch = jest.fn(() => null);
    TeamDetails.findOne = jest.fn(() => Promise.reject(new Error('')));

    try {
      await TeamDetailsService.getTeamDetailsByTeamUrl(teamUrl);
      expect(cache.fetch).toBeCalledTimes(1);
    } catch (error) {
      expect(error.message).toEqual('Could not get the team details.');
      done();
    }
  });
});
