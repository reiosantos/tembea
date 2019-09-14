import models from '../database/models';

const { TripDetail } = models;

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
