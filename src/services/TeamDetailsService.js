import models from '../database/models';
import cache from '../cache';

const { TeamDetails } = models;
const getTeamDetailsKey = teamId => `teamDetails_${teamId}`;

class TeamDetailsService {
  static async getTeamDetails(teamId) {
    const fetchedValue = cache.fetch(getTeamDetailsKey(teamId));
    if (fetchedValue) {
      return fetchedValue;
    }

    try {
      const teamDetails = await TeamDetails.findByPk(teamId);
      cache.saveObject(getTeamDetailsKey(teamId), teamDetails);
      return teamDetails;
    } catch (error) {
      throw new Error('Could not get team details from DB');
    }
  }

  static async saveTeamDetails(teamObject) {
    try {
      await TeamDetails.upsert({ ...teamObject });
      cache.saveObject(getTeamDetailsKey(teamObject.teamId), teamObject);
      return teamObject;
    } catch (error) {
      throw new Error('Could not update teamDetails or write new teamDetails to DB');
    }
  }
}

export default TeamDetailsService;
