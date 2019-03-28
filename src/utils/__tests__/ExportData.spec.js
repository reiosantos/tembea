import RouteService from '../../services/RouteService';
import {
  routesMock, departmentsMock, tripsMock, dataFromDBMock, columns,
  pendingTripData, columnHeaders, filteredData, newFormedData, listOfDataObj
} from '../__mocks__/ExportDataMocks';
import ExportData, { DataFromDB } from '../ExportData';
import DepartmentService from '../../services/DepartmentService';
import { TripService } from '../../services/TripService';

describe('DataFromDB', () => {
  let dataFromDB;
  let tripMock;
  beforeEach(() => {
    dataFromDB = new DataFromDB();
    tripMock = tripsMock();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('getRoutes', () => {
    it('should return routes fetched from the db', async () => {
      const routeSpy = jest.spyOn(RouteService, 'getRoutes')
        .mockReturnValue({ routes: [...routesMock] });

      const result = await dataFromDB.getRoutes();

      expect(routeSpy).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(routesMock);
      expect(result.columns[0]).toEqual({
        header: 'Name', height: 40, id: 'name', width: 120
      });
      expect(result.margins).toEqual({
        margins: {
          top: 40, bottom: 40, left: 25, right: 30
        }
      });
    });
  });

  describe('getDepartments', () => {
    it('should return departments fetched from the db', async () => {
      const departmentSpy = jest.spyOn(DepartmentService, 'getAllDepartments')
        .mockReturnValue({ rows: [...departmentsMock] });

      const result = await DataFromDB.getDepartments();

      expect(departmentSpy).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(departmentsMock);
      expect(result.columns[0]).toEqual({
        header: 'Department', height: 40, id: 'name', width: 140
      });
      expect(result.margins).toEqual({
        margins: {
          top: 40, bottom: 40, left: 60, right: 60
        }
      });
    });
  });

  describe('getTripItinerary', () => {
    it('should return trip itinerary fetched from the db', async () => {
      const itinerarySpy = jest.spyOn(TripService.prototype, 'getTrips')
        .mockReturnValue({ trips: tripMock });

      const result = await dataFromDB.getTripItinerary();

      expect(itinerarySpy).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(tripMock);
      expect(result.columns[0]).toEqual({
        header: 'Requested On', height: 40, id: 'requestedOn', width: 85
      });
      expect(result.margins).toEqual({
        margins: {
          top: 40, bottom: 40, left: 15, right: 10
        }
      });
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending trips requests fetched from the db', async () => {
      const pendingTripsSpy = jest.spyOn(TripService.prototype, 'getTrips')
        .mockReturnValue({ trips: tripMock });

      const result = await dataFromDB.getPendingRequests();

      expect(pendingTripsSpy).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(tripMock);
      expect(result.columns[0]).toEqual({
        header: 'Requested On', height: 40, id: 'requestedOn', width: 85
      });
      expect(result.margins).toEqual({
        margins: {
          top: 40, bottom: 40, left: 15, right: 10
        }
      });
    });
  });

  describe('fetchData', () => {
    it('should fetch data from from correct table', async () => {
      const data = { routes: [] };
      const spy = jest.spyOn(dataFromDB, 'getRoutes')
        .mockImplementation(() => data);

      const result = await dataFromDB.fetchData('routes');

      expect(spy).toBeCalled();
      expect(result).toEqual(data);
    });
  });
});

describe('ExportData', () => {
  let fetchDataSpy;
  beforeEach(() => {
    fetchDataSpy = jest.spyOn(DataFromDB.prototype, 'fetchData')
      .mockReturnValue({ dataFromDBMock });
  });

  describe('createPDF', () => {
    it('should return a pdf document', async () => {
      const query = { table: 'routes' };

      const result = await ExportData.createPDF(query);

      expect(fetchDataSpy).toBeCalledWith('routes');
      expect(result).toEqual({});
    });
  });

  describe('createCSV', () => {
    it('should return new  data', async () => {
      const query = { table: 'pendingRequests' };
      jest.spyOn(ExportData, 'getColumnHeaders').mockResolvedValue(columnHeaders);
      await jest.spyOn(ExportData, 'formNewRequiredData').mockResolvedValue(newFormedData);
      await ExportData.createCSV(query);
      expect(fetchDataSpy).toBeCalledWith('pendingRequests');
    });
  });


  describe('filterRequired', () => {
    it('should return a list of object data', () => {
      const result = ExportData.filterRequired(pendingTripData, columnHeaders);
      expect(result).toEqual(filteredData);
    });
  });

  describe('formNewRequiredData', () => {
    it('should return new formed data', async () => {
      const result = await ExportData.formNewRequiredData(listOfDataObj, columnHeaders);
      expect(result).toEqual(newFormedData);
    });
  });

  describe('getColumnHeaders', () => {
    it('should return a list of headers', async () => {
      const result = await ExportData.getColumnHeaders(columns);
      expect(result).toEqual(columnHeaders);
    });
  });

  describe('formatHeaders', () => {
    it('should return new data with capitalized headers', async () => {
      const result = await ExportData.formatHeaders('head.name');
      expect(result).toEqual('Lead');
    });
  });
});
