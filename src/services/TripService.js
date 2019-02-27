import moment from 'moment';
import models from '../database/models';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import Utils from '../utils';

const { TripRequest, Department } = models;

export class TripService {
  constructor() {
    this.defaultInclude = [
      'requester',
      'origin',
      'destination',
      'rider',
      'approver',
      'confirmer'
    ];
  }

  static sequelizeWhereClauseOption(filterParams) {
    const { status: tripStatus, department: departmentName } = filterParams;
    if (!tripStatus && !departmentName) return {};
    if (tripStatus) return { tripStatus };
    if (departmentName) return { departmentName };
  }

  async getTrips(pageable, where) {
    const { page, size } = pageable;
    const { departmentName: name } = where;
    const department = name
      ? {
        model: Department,
        as: 'department',
        where: { name }
      }
      : 'department';
    /* eslint no-param-reassign: ["error", { "props": false }] */
    delete where.departmentName;
    const filter = {
      where,
      include: [...this.defaultInclude, department]
    };
    const paginatedRoutes = new SequelizePaginationHelper(
      TripRequest,
      filter,
      size
    );
    const { data, pageMeta } = await paginatedRoutes.getPageItems(page);
    const trips = data.map(trip => TripService.serializeTripRequest(trip));
    return { trips, ...pageMeta };
  }

  static serializeUser(requester) {
    if (requester) {
      const { email, slackId, name: username } = requester;
      const name = Utils.getNameFromEmail(email) || username;
      return {
        name,
        email,
        slackId
      };
    }
  }

  static serializeAddress(address) {
    if (address && address.dataValues) {
      return address.dataValues.address;
    }
  }

  static serializeDepartment(department) {
    if (department && department.dataValues) {
      const { name } = department.dataValues;
      return name;
    }
  }

  static serializeTripRequest(trip) {
    const {
      requester, origin, destination, rider, department,
      approver, confirmer, decliner, ...tripInfo
    } = trip;
    const {
      name, tripStatus: status, departureTime, arrivalTime, createdAt, tripType, noOfPassenger
    } = tripInfo.dataValues;
    const dtIsoTime = moment(departureTime, 'YYYY-MM-DD HH:mm:ss').toISOString();
    return {
      name,
      status,
      arrivalTime,
      type: tripType,
      passenger: noOfPassenger,
      departureTime: dtIsoTime,
      requestedOn: createdAt,
      department: TripService.serializeDepartment(department),
      destination: TripService.serializeAddress(destination),
      pickup: TripService.serializeAddress(origin),
      decliner: TripService.serializeUser(decliner),
      rider: TripService.serializeUser(rider),
      requester: TripService.serializeUser(requester),
      approvedBy: TripService.serializeUser(approver) || {},
      confirmedBy: TripService.serializeUser(confirmer) || {}
    };
  }
}
const tripService = new TripService();
export default tripService;
