import ExportData from '../../../utils/ExportData';
import ExportDocument from '../ExportsController';
import HttpError from '../../../helpers/errorHandler';
import { newFormedData } from '../../../utils/__mocks__/ExportDataMocks';
import serverError from '../__mocks__/ExportsControllerMocks';

describe('ExportController', () => {
  let req;
  let res;
  let req2;
  let res2;
  let req3;
  describe('exportToPDF', () => {
    let exportDataSpy;
    const pdfMock = {
      pipe: jest.fn(),
      end: jest.fn()
    };
    beforeEach(() => {
      req = { query: { table: 'table' } };
      res = { writeHead: jest.fn() };
      exportDataSpy = jest.spyOn(ExportData, 'createPDF').mockResolvedValue(pdfMock);
    });

    it('should create a pdf and respond', async () => {
      await ExportDocument.exportToPDF(req, res);

      expect(exportDataSpy).toHaveBeenCalledWith({ table: 'table' });
      expect(res.writeHead).toBeCalledTimes(1);
      expect(pdfMock.pipe).toBeCalledWith(res);
      expect(pdfMock.end).toBeCalledTimes(1);
    });
  });

  describe('exportToCSV', () => {
    beforeEach(() => {
      req2 = { query: { table: 'pendingRequests', sort: 'name,asc,batch,asc' } };
      res2 = { writeHead: jest.fn(), write: jest.fn(), end: jest.fn() };
      req3 = { query: { table: '', sort: 'name,asc,batch,asc' } };
      HttpError.sendErrorResponse = jest.fn();
    });

    afterEach((done) => {
      jest.restoreAllMocks();
      done();
    });

    it('should return a csv data', async () => {
      jest.spyOn(ExportData, 'createCSV').mockResolvedValue(newFormedData);
      await ExportDocument.exportToCSV(req2, res2);
      expect(ExportData.createCSV).toBeCalledTimes(1);
      expect(res2.writeHead).toBeCalledTimes(1);
      expect(res2.write).toBeCalledTimes(1);
      expect(res2.end).toBeCalledTimes(1);
    });

    it('should return server error', async () => {
      jest.spyOn(HttpError, 'sendErrorResponse').mockResolvedValue(serverError);
      const result = await ExportDocument.exportToCSV(req3, res2);
      expect(result).toEqual(serverError);
    });
  });
});
