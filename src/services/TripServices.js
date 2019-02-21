/* eslint-disable indent */
import models from '../database/models';

const { TripRequest } = models;

class TripServices {
    static async findTrip(tripId) {
        const trip = await TripRequest.findById(tripId);
        if (!trip) {
            return false;
        }
        return true;
    }
}

export default TripServices;
