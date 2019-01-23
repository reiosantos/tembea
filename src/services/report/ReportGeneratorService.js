import fs from 'fs';
import GenerateExcelBook from './GenerateExcelBook';
import GenerateReportData from './ReportData';

class ReportGeneratorService {
  constructor(numberOfMonthsBack = 1, reportType = 'excel') {
    this.allowedTypes = ['excel', 'csv'];
    this.reportType = reportType;
    this.numberOfMonthsBack = numberOfMonthsBack;
    if (!this.allowedTypes.includes(reportType)) {
      throw Error(`The allowed report types are [${this.allowedTypes}]`);
    }
  }

  generateMonthlyReport() {
    return GenerateReportData.getReportData(this.numberOfMonthsBack);
  }

  getEmailAttachmentFile(tripData) {
    if (!Array.isArray(tripData)) throw Error('headers should be an array');

    if (this.reportType === 'excel') {
      return GenerateExcelBook.getWorkBook(tripData);
    }
    throw Error(`The allowed report types are [${this.allowedTypes}]`);
  }

  static async writeAttachmentToStream(workBook) {
    if (!workBook || typeof workBook !== 'object') throw Error('A workbook object is required');
    const stream = fs.createWriteStream('excel.xlsx', { autoClose: true, flags: 'w' });
    await workBook.xlsx.write(stream);
    return stream;
  }

  static async getMonthlyTripsSummary(monthsBack) {
    const monthOneTripData = await GenerateReportData.getReportData(monthsBack);
    const totalSummary = GenerateReportData.generateTotalsSummary(monthOneTripData);
    return totalSummary;
  }

  static async getOverallTripsSummary() {
    const monthOneSummary = await ReportGeneratorService.getMonthlyTripsSummary(1);
    const { totalTripsCompleted: monthTwoTripsCompleted } = await ReportGeneratorService.getMonthlyTripsSummary(2);

    const percentage = GenerateReportData.calculateLastMonthPercentageChange(
      monthOneSummary.totalTripsCompleted, monthTwoTripsCompleted
    );

    return { ...monthOneSummary, percentageChange: percentage };
  }
}

export default ReportGeneratorService;
