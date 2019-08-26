import database from '../database';

const { models: { TripDetail } } = database;

class TripDetailsService {
  static async createDetails(riderPhoneNo, travelTeamPhoneNo, flightNumber) {
    const tripDetail = await TripDetail.create({
      riderPhoneNo,
      travelTeamPhoneNo,
      flightNumber
    });
    return tripDetail;
  }
}
export default TripDetailsService;
