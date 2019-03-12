/* eslint-disable max-len */
import models from '../../database/models';
import Utils from '../../utils';
import tripService from '../TripService';

const { sequelize } = models;

class GenerateReportData {
  static prepareWhereClause(numberOfMonthsBack) {
    return `
    "tripStatus" = ANY(ARRAY['DeclinedByOps', 'DeclinedByManager', 'Completed']::"enum_TripRequests_tripStatus"[]) AND
    (DATE_TRUNC('month', NOW() - INTERVAL '${numberOfMonthsBack} months') = DATE_TRUNC('month', TO_DATE("TripRequest"."departureTime", 'YYYY-MM-DD HH24:MI:SS'))) AND
    (DATE_TRUNC('month', NOW()) > DATE_TRUNC('month', "TripRequest"."createdAt")) AND
    (DATE_TRUNC('month', NOW() - INTERVAL '${numberOfMonthsBack} months') >= DATE_TRUNC('month', "TripRequest"."createdAt"))
    `;
  }

  static getReportData(numberOfMonthsBack) {
    const qString = GenerateReportData.prepareWhereClause(numberOfMonthsBack);

    return tripService.getAll(
      { where: sequelize.literal(qString) },
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
      if (!summary.departments[trip['department.name']]) {
        summary.departments[trip['department.name']] = { completed: 0, declined: 0, total: 0 };
      }

      if (trip.tripStatus === 'Completed') {
        summary.departments[trip['department.name']].completed += 1;
        summary.totalTripsCompleted += 1;
      } else {
        summary.totalTripsDeclined += 1;
        summary.departments[trip['department.name']].declined += 1;
      }
      summary.departments[trip['department.name']].total += 1;
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
