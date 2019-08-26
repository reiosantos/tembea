import PdfDocument from 'pdfkit';
import PdfTable from 'voilab-pdf-table';
import RouteService from '../services/RouteService';
import SequelizePaginationHelper from '../helpers/sequelizePaginationHelper';
import { MAX_INT as all } from '../helpers/constants';
import DepartmentService from '../services/DepartmentService';
import { TripService } from '../services/TripService';
import TripsController from '../modules/trips/TripsController';

export class DataFromDB {
  constructor(query = {}) {
    const { sort } = query;
    this.sort = sort || 'id,asc';
    this.filterParams = query;
    this.getRoutes = this.getRoutes.bind(this);
    this.getTripItinerary = this.getTripItinerary.bind(this);
    this.getPendingRequests = this.getPendingRequests.bind(this);
  }

  async fetchData(table) {
    const tables = {
      routes: this.getRoutes,
      departments: DataFromDB.getDepartments,
      tripItinerary: this.getTripItinerary,
      pendingRequests: this.getPendingRequests
    };
    const { [table]: getData } = tables;

    return getData();
  }

  static getWidth(key, long, short = 65) {
    let width = short;
    const longWidths = [
      'name', 'regNumber', 'location', 'head.name', 'department', 'departureTime',
      'requestedOn'
    ];
    if (longWidths.includes(key)) {
      width = long;
    }
    return width;
  }

  static defaultColumns(row, longWidth, shortWidth) {
    /* eslint array-callback-return: off */
    const keys = Object.keys(row);
    const columns = [];

    keys.map((key) => {
      const width = DataFromDB.getWidth(key, longWidth, shortWidth);
      columns.push({
        id: key, header: row[key], width, height: 40
      });
    });
    return columns;
  }

  static setMargins(left, right) {
    return {
      margins: {
        top: 40, bottom: 40, left, right
      }
    };
  }

  static setInUse(routes) {
    return routes.map((route) => {
      if (route.inUse === 0) route.inUse = '-';
      return route;
    });
  }

  static flattenTripsObject(trips) {
    /* eslint no-param-reassign: ["error", { "props": false }] */
    return trips.map((trip) => {
      trip.rider = trip.rider.name;
      trip.requester = trip.requester.name || 'None';
      trip.approvedBy = trip.approvedBy.name || 'None';
      trip.confirmedBy = trip.confirmedBy.name || 'None';
      trip.requestedOn = trip.requestedOn.toString();
      if (typeof (trip.departureTime) === 'string') {
        trip.departureTime = new Date(trip.departureTime).toString();
      } else { trip.departureTime = trip.departureTime.toString(); }
      return trip;
    });
  }

  async getRoutes() {
    const sort = SequelizePaginationHelper.deserializeSort(this.sort);
    const pageable = { sort, page: 1, size: all };
    let { routes } = await RouteService.getRoutes(pageable);
    routes = DataFromDB.setInUse(routes);
    const columnHeaders = {
      name: 'Name',
      batch: 'Batch',
      takeOff: 'TakeOff Time',
      capacity: 'Capacity',
      inUse: 'In Use',
      regNumber: 'Vehicle',
      status: 'Status'
    };
    const columns = DataFromDB.defaultColumns(columnHeaders, 120);
    const margins = DataFromDB.setMargins(25, 30);
    return { data: routes, columns, margins };
  }

  static async getDepartments() {
    const { rows: departments } = await DepartmentService.getAllDepartments(all, 1);
    const columnHeaders = {
      name: 'Department', location: 'Location', 'head.name': 'Lead', status: 'Status'
    };
    const columns = DataFromDB.defaultColumns(columnHeaders, 140, 70);
    const margins = DataFromDB.setMargins(60, 60);
    return { data: departments, columns, margins };
  }

  async getTripItinerary(status = 'Confirmed') {
    const pageable = { page: 1, size: all };
    const query = TripsController.getRequestQuery({ query: this.filterParams });
    const where = TripService.sequelizeWhereClauseOption({ ...query, status });
    const tripService = new TripService();
    const { trips } = await tripService.getTrips(pageable, where);
    const flattenedTrips = DataFromDB.flattenTripsObject(trips);
    const columnHeaders = {
      requestedOn: 'Requested On',
      departureTime: 'Departing On',
      pickup: 'Pickup',
      destination: 'Destination',
      requester: 'Requested By',
      department: 'Department',
      rider: 'Rider',
      cost: 'Cost',
      approvedBy: 'Approved By',
      confirmedBy: 'Confirmed By'
    };
    const columns = DataFromDB.defaultColumns(columnHeaders, 85, 73);
    const margins = DataFromDB.setMargins(15, 10);
    return {
      data: flattenedTrips, columns, margins, orientation: 'landscape'
    };
  }

  getPendingRequests() {
    return this.getTripItinerary('Pending');
  }
}

class ExportData {
  static async createPDF(query) {
    const { table: tableName } = query;
    const dataFromDB = new DataFromDB(query);
    const {
      data, columns, margins, orientation
    } = await dataFromDB.fetchData(tableName);
    const otherParams = { ...margins };
    if (orientation) otherParams.layout = orientation;
    const pdf = new PdfDocument({ autoFirstPage: false, ...otherParams });
    const table = new PdfTable(pdf, { bottomMargin: 30 });
    table
      .setColumnsDefaults({
        headerBorder: ['L', 'T', 'B', 'R'],
        headerPadding: [15, 0, 0, 5],
        border: ['L', 'T', 'B', 'R'],
        align: 'left',
        padding: [15, 0, 0, 5]
      })
      .addColumns(columns)
      .onPageAdded((newTable) => newTable.addHeader());
    pdf.font('Times-Roman', 10);
    pdf.addPage({ ...otherParams });
    table.addBody(data);
    return pdf;
  }

  static async createCSV(query) {
    const { table: tableName } = query;
    const dataFromDB = new DataFromDB(query);
    const { data, columns } = await dataFromDB.fetchData(tableName);
    const columnsHeaders = ExportData.getColumnHeaders(columns);
    const newFormedData = ExportData.formNewRequiredData(data, columnsHeaders);
    return newFormedData;
  }

  static filterRequired(obj, columnsHeaders) {
    const myDict = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const key of columnsHeaders) {
      myDict[ExportData.formatHeaders(key)] = obj[key];
    }
    return myDict;
  }

  static formNewRequiredData(data, headers) {
    const newFormedData = data.map((objData) => ExportData.filterRequired(
      objData, headers
    ));
    return newFormedData;
  }

  static formatHeaders(keyHeader) {
    const camelCaseWord = keyHeader.match(/[A-Z]/g);
    if (camelCaseWord) {
      const firstChar = `${keyHeader[0].toUpperCase()}`;
      const firstWordPiece = `${firstChar}${keyHeader.slice(1, keyHeader.indexOf(camelCaseWord[0]))}`;
      const lastWordPiece = `${keyHeader.slice(keyHeader.indexOf(camelCaseWord[0]), keyHeader.length)}`;
      const whollyWord = `${firstWordPiece} ${lastWordPiece}`;
      return whollyWord;
    }
    const strDotStr = keyHeader.match(/[.]/g);
    if (strDotStr) {
      if (keyHeader === 'head.name') {
        const whollyWord = 'Lead';
        return whollyWord;
      }
    }
    const firstWordPiece = `${keyHeader[0].toUpperCase()}`;
    const whollyWord = `${firstWordPiece}${keyHeader.slice(1, keyHeader.length)}`;
    return whollyWord;
  }

  static getColumnHeaders(columns) {
    const listOfHeaders = columns.map((obj) => obj.id);
    return listOfHeaders; // List of headers;
  }
}

export default ExportData;
