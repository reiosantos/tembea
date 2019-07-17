/* eslint-disable max-len */
import moment from 'moment';
import Utils from '../../utils';
import tripService, { TripService } from '../TripService';


class GenerateReportData {
  static async getReportData(numberOfMonthsBack) {
    const monthsBackDate = moment(new Date()).subtract({ months: numberOfMonthsBack }).format('YYYY-MM-DD');
    const dateFilters = {
      requestedOn: { after: monthsBackDate }
    };
    const where = TripService.sequelizeWhereClauseOption({ ...dateFilters });
    return tripService.getAll(
      { where },
      { order: [['createdAt', 'DESC'], ['updatedAt', 'DESC']] }
    );
  }

  static generateTotalsSummary(trips) {
    const summary = {
      month: Utils.getPreviousMonth(),
      totalTrips: trips.length,
      totalTripsDeclined: 0,
      totalTripsCompleted: 0,
      departments: {}
    };
    trips.forEach((trip) => {
      if (!summary.departments[trip.department.name]) {
        summary.departments[trip.department.name] = { completed: 0, declined: 0, total: 0 };
      }

      if (trip.tripStatus === 'Completed') {
        summary.departments[trip.department.name].completed += 1;
        summary.totalTripsCompleted += 1;
      } else {
        summary.totalTripsDeclined += 1;
        summary.departments[trip.department.name].declined += 1;
      }
      summary.departments[trip.department.name].total += 1;
    });
    return summary;
  }

  static calculateLastMonthPercentageChange(totalTripsCompletedLastMonth, totalTakenTwoMonthsBack) {
    const percentage = (((totalTripsCompletedLastMonth - totalTakenTwoMonthsBack)
      / (totalTakenTwoMonthsBack || totalTripsCompletedLastMonth || 1)) * 100).toFixed(2);

    return percentage;
  }
}

export default GenerateReportData;
