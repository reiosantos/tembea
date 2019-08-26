import database from '../database';
import cache from '../cache';
import bugsnagHelper from '../helpers/bugsnagHelper';

const { models: { TeamDetails } } = database;
const getTeamDetailsKey = (teamId) => `teamDetails_${teamId}`;

class TeamDetailsService {
  static async getTeamDetails(teamId) {
    const fetchedValue = await cache.fetch(getTeamDetailsKey(teamId));
    if (fetchedValue) {
      return fetchedValue;
    }
    try {
      const dataValues = await TeamDetails.findByPk(teamId);
      await cache.saveObject(getTeamDetailsKey(teamId), dataValues);
      return dataValues;
    } catch (error) {
      bugsnagHelper.log(error);
      throw new Error('Could not get team details from DB');
    }
  }

  static async getTeamDetailsByTeamUrl(teamUrl) {
    const fetchedValue = await cache.fetch(getTeamDetailsKey(teamUrl));
    if (fetchedValue) {
      return fetchedValue;
    }

    try {
      const teamDetails = await TeamDetails.findOne({
        raw: true,
        where: {
          teamUrl: `https://${teamUrl}`
        }
      });
      await cache.saveObject(getTeamDetailsKey(teamUrl), teamDetails);
      return teamDetails;
    } catch (error) {
      bugsnagHelper.log(error);
      throw new Error('Could not get the team details.');
    }
  }

  static async getTeamDetailsBotOauthToken(teamId) {
    const {
      botToken: slackBotOauthToken
    } = await TeamDetailsService.getTeamDetails(teamId);
    return slackBotOauthToken;
  }

  static async getAllTeams() {
    try {
      const allTeams = await TeamDetails.findAll();
      return allTeams;
    } catch (error) {
      bugsnagHelper.log(error);
      throw new Error('Could not get all teamDetails from DB');
    }
  }

  static async saveTeamDetails(teamObject) {
    try {
      await TeamDetails.upsert({ ...teamObject });
      await cache.saveObject(getTeamDetailsKey(teamObject.teamId), teamObject);
      return teamObject;
    } catch (error) {
      bugsnagHelper.log(error);
      throw new Error(
        'Could not update teamDetails or write new teamDetails to DB'
      );
    }
  }
}

export default TeamDetailsService;
