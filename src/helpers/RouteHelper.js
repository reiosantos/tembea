import AddressService from '../services/AddressService';
import LocationService from '../services/LocationService';
import RouteService, { routeService } from '../services/RouteService';
import { cabService } from '../services/CabService';
import { expectedCreateRouteObject } from '../utils/data';
import RouteServiceHelper from './RouteServiceHelper';

class RouteHelper {
  static checkRequestProps(createRouteRequest) {
    const receivedProps = Object.keys(createRouteRequest);

    return expectedCreateRouteObject.reduce((acc, item) => {
      if (!receivedProps.includes(item)) {
        acc = `${acc}, ${item}`; // eslint-disable-line no-param-reassign
      }
      return acc;
    }, '');
  }

  static findPercentageUsage(record, allUsageRecords, dormantRouteBatches) {
    const usageRecords = Object.values(record);
    const confirmedRecords = usageRecords.filter(
      confirmed => confirmed.userAttendStatus === 'Confirmed'
    );
    const batchUsage = {};
    const { RouteBatchName, Route } = record[0];
    batchUsage.Route = Route;
    batchUsage.RouteBatch = RouteBatchName;
    batchUsage.users = usageRecords.length;
    if (!confirmedRecords.length) {
      batchUsage.percentageUsage = 0;
      dormantRouteBatches.push(batchUsage);
      return dormantRouteBatches;
    }
    const percentageUsage = (confirmedRecords.length / usageRecords.length) * 100;
    batchUsage.percentageUsage = Math.round(percentageUsage);
    allUsageRecords.push(batchUsage);
    return allUsageRecords;
  }

  static findMaxOrMin(arrayList, status) {
    const emptyRecord = {
      Route: 'N/A',
      RouteBatch: '',
      users: 0,
      percentageUsage: 0
    };
    return arrayList.reduce((prev, current) => {
      if (status === 'max') {
        return (prev.percentageUsage === current.percentageUsage)
          ? RouteHelper.reducerHelper(prev, current, 'users', 'max')
          : RouteHelper.reducerHelper(prev, current, 'percentageUsage', 'max');
      }
      if (arrayList.length === 1) {
        return emptyRecord;
      }
      return (prev.percentageUsage === current.percentageUsage)
        ? RouteHelper.reducerHelper(prev, current, 'users', 'min')
        : RouteHelper.reducerHelper(prev, current, 'percentageUsage', 'min');
    }, { emptyRecord });
  }

  static reducerHelper(prev, current, attribute, status) {
    if (status === 'min') {
      return prev[attribute] < current[attribute] ? prev : current;
    }
    return prev[attribute] > current[attribute] ? prev : current;
  }

  static checkNumberValues(value, field) {
    const isInter = Number.isInteger(parseInt(value, 10));
    const isGreaterThanZero = parseInt(value, 10) > 0;

    if (isInter && isGreaterThanZero) return [];
    return [`${field} must be a non-zero integer greater than zero`];
  }

  static async checkThatAddressAlreadyExists(address) {
    const existingAddress = await AddressService.findAddress(address);
    return !!existingAddress;
  }

  static async checkThatLocationAlreadyExists(coordinates) {
    let location;
    if (coordinates) {
      const { lat: latitude, lng: longitude } = coordinates;
      location = await LocationService.findLocation(longitude, latitude);
    }
    return !!location;
  }

  static async checkThatVehicleRegNumberExists(vehicleRegNumber) {
    const cab = await cabService.findByRegNumber(vehicleRegNumber);
    return [!!cab, cab];
  }

  static async checkThatRouteNameExists(name) {
    const route = await routeService.getRouteByName(name);
    return [!!route, route];
  }

  static async createNewRouteBatch(body) {
    const {
      routeName,
      destination: {
        address, coordinates: { lat: latitude, lng: longitude }
      },
      vehicle: vehicleRegNumber, takeOffTime, capacity
    } = body;

    const destinationAddress = await AddressService.createNewAddress(
      longitude, latitude, address
    );

    const data = {
      name: routeName,
      vehicleRegNumber,
      capacity,
      takeOff: takeOffTime,
      destinationName: destinationAddress.address
    };

    const routeInfo = await RouteService.createRouteBatch(data);
    return routeInfo;
  }

  static async duplicateRouteBatch(id) {
    const routeBatch = await RouteService.getRouteBatchByPk(id);
    if (!routeBatch) {
      return 'Route does not exist';
    }
    const batch = await RouteHelper.getNewBatchDetails(routeBatch);
    return batch;
  }

  static async getNewBatchDetails(routeBatch) {
    const {
      route, route: { name, imageUrl, destination }, cabDetails, routeId, cabId
    } = routeBatch;

    const routeDetails = await RouteService.createRoute(name, imageUrl, destination);
    const updatedBatch = RouteService.updateBatchLabel(routeDetails);
    const newBatchObject = RouteHelper.batchObject(routeBatch, updatedBatch);
    const batch = await RouteService.createBatch(
      newBatchObject, routeId, cabId
    );
    batch.cabDetails = cabDetails;
    batch.route = route;

    return RouteServiceHelper.serializeRouteBatch(batch);
  }

  /**
   * @description This validator checks to ensure that the route request status can be modified
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @param  {function} next The next middleware
   */
  static validateRouteStatus(routeRequest) {
    const { status } = routeRequest;

    if (status === 'Approved' || status === 'Declined') {
      return `This request has already been ${status.toLowerCase()}`;
    }

    if (status !== 'Confirmed') {
      return 'This request needs to be confirmed by the manager first';
    }

    return true;
  }

  static batchObject(routeBatch, batch) {
    const { takeOff, capacity, status } = routeBatch;
    const data = {
      takeOff,
      capacity,
      status,
      batch
    };
    return data;
  }

  static pageDataObject(result) {
    const pageData = {
      pageMeta: {
        totalPages: result.totalPages,
        page: result.pageNo,
        totalResults: result.totalItems.length,
        pageSize: result.itemsPerPage
      },
      routes: result.routes
    };
    return pageData;
  }
}

export default RouteHelper;
