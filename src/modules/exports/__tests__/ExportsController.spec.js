import ExportData from '../../../utils/ExportData';
import ExportDocument from '../ExportsController';

describe('ExportController', () => {
  let req;
  let res;
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
      req = { body: { name: 'myDoc' } };
      res = {
        status: jest.fn(() => ({ json: jest.fn() }))
          .mockReturnValue({ json: jest.fn() })
      };
    });

    it('should return a json object for dummy method exportToCSV', () => {
      ExportDocument.exportToCSV(req, res);

      expect(res.status).toBeCalledWith(200);
      expect(res.status().json).toHaveBeenCalledWith({
        success: true,
        message: 'myDoc.csv exported successfully!'
      });
    });
  });
});
