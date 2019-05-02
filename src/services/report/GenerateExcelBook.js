import { Workbook } from 'exceljs';
import Utils from '../../utils/index';
import GenerateReportData from './ReportData';

class GenerateExcelBook {
  static getCellStyle(isColHeader) {
    if (isColHeader) {
      return {
        name: 'Times New Roman', color: { argb: '000000' }, family: 2, size: 13, bold: true
      };
    }
    return {
      name: 'Times New Roman', color: { argb: '000000' }, size: 11, bold: false
    };
  }

  static getCellFillColor(color) {
    return {
      type: 'gradient',
      gradient: 'angle',
      degree: 0,
      stops: [
        { position: 0, color: { argb: color } }, { position: 1, color: { argb: color } }
      ]
    };
  }

  static getWorkBook(tripData) {
    const workbook = GenerateExcelBook.getNewWorkBook(2);

    const sheet1 = workbook.getWorksheet(1);
    GenerateExcelBook.prepareSummary(sheet1, tripData);

    const sheet2 = workbook.getWorksheet(2);
    sheet2.name = 'Trip Details';
    sheet2.mergeCells('A2:K3');
    sheet2.columns.forEach((column) => { // eslint-disable-next-line no-param-reassign
      column.width = 24;
    });
    const pageHeader = sheet2.getCell('K3');
    GenerateExcelBook.prepareSheetMainHeader(pageHeader, 'Details');
    const headers = [
      'S/N', 'Requested On', 'Departure Date', 'Pickup', 'Destination',
      'Requested By', 'Department', 'Passenger', 'Approved By', 'Confirmed By'
    ];
    GenerateExcelBook.populateSheetRowData(sheet2, headers, 'A', 5, true);
    GenerateExcelBook.generateRows(sheet2, tripData, 'A', 6);
    return workbook;
  }

  static getNewWorkBook(numberOfSheets) {
    const workBook = new Workbook();
    workBook.lastModifiedBy = 'Tembea Bot';
    workBook.created = new Date();
    workBook.modified = new Date();
    for (let i = 1; i <= numberOfSheets; i += 1) {
      workBook.addWorksheet(`Sheet${i}`);
    }
    return workBook;
  }

  static prepareSummaryCellHeader(summaryCell) {
    const summaryCellHeader = summaryCell;
    summaryCellHeader.value = 'Summary';
    summaryCellHeader.alignment = { vertical: 'middle', horizontal: 'center' };
    summaryCellHeader.font = {
      color: { argb: 'ffffff' }, bold: true, family: 1, size: 14, name: 'Times New Roman'
    };
    summaryCellHeader.fill = GenerateExcelBook.getCellFillColor('1768ff');
  }

  static prepareSheetMainHeader(pageHeaderCell, title) {
    const pageHeader = pageHeaderCell;
    const previousMonth = Utils.getPreviousMonth();
    pageHeader.value = `Title: ${title} of trips taken in ${previousMonth}`;
    pageHeader.font = {
      name: 'Times New Roman',
      color: { argb: '0540CC' },
      family: 2,
      size: 16,
      underline: true,
      bold: true
    };
    pageHeader.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
  }

  static populateSheetRowData(
    sheetRef, data, startColumn, startRow, isColHeader = false
  ) {
    const sheet = sheetRef;

    let currentColumn = startColumn;
    data.forEach((item, index) => {
      const currentCell = `${currentColumn}${startRow}`;
      sheet.getCell(currentCell).value = data[index];
      sheet.getCell(currentCell).font = GenerateExcelBook.getCellStyle(isColHeader);

      currentColumn = Utils.nextAlphabet(currentColumn);
    });
  }

  static generateRows(sheet, tripData, startCol, startRow) {
    const startColumn = startCol;
    let currentRow = startRow;
    tripData.forEach((record) => {
      const data = [
        record.id,
        Utils.formatDate(record.createdAt),
        Utils.formatDate(record.departureTime),
        (record.origin) ? record.origin.address : '',
        (record.destination) ? record.destination.address : '',
        record.requester ? record.requester.name : '',
        record.department ? record.department.name : '',
        record.rider ? record.rider.name : '',
        record.approver ? record.approver.name : '',
        record.confirmer ? record.confirmer.name : ''
      ];
      GenerateExcelBook.populateSheetRowData(sheet, data, startColumn, currentRow);
      currentRow += 1;
    });
  }

  static prepareSummary(sheetRef, tripData) {
    const sheet = sheetRef;
    sheet.name = 'Summary';
    sheet.mergeCells('A2:D3');
    sheet.columns.forEach((column) => {
      // eslint-disable-next-line no-param-reassign
      column.width = 20;
    });
    const pageHeader = sheet.getCell('D3');
    GenerateExcelBook.prepareSheetMainHeader(pageHeader, 'Summary');

    sheet.mergeCells('A5:D5');

    const summaryCellHeader = sheet.getCell('D5');
    GenerateExcelBook.prepareSummaryCellHeader(summaryCellHeader);

    const summary = GenerateReportData.generateTotalsSummary(tripData);
    const summaryHeaders = ['Department', 'Completed trips', 'Declined', 'Total'];
    GenerateExcelBook.populateSheetRowData(sheet, summaryHeaders, 'A', 7, true);

    GenerateExcelBook.fillSummaryData(summary, sheet);
  }

  static fillSummaryData(summary, sheetRef) {
    const sheet = sheetRef;
    const startColumn = 'A';
    let currentRow = 8;
    let currentColumn = startColumn;
    const departments = Object.keys(summary.departments);

    departments.forEach((department) => {
      const currentCell = `${currentColumn}${currentRow}`;
      sheet.getCell(currentCell).value = department !== 'null' ? department : '';
      sheet.getCell(currentCell).font = { bold: true, name: 'Times New Roman' };

      ['completed', 'declined', 'total'].forEach((property) => {
        currentColumn = GenerateExcelBook.fnFillDataRows(
          sheetRef, currentRow, summary, currentColumn, department, property
        );
      });
      currentRow += 1;
      currentColumn = startColumn;
    });

    GenerateExcelBook.fillTotalRows(
      currentRow, currentColumn, sheet, summary, startColumn
    );
  }

  static fillTotalRows(currentRowVal, currentColumnVal, sheetRef, summary, startColumn) {
    let currentRow = currentRowVal;
    let currentColumn = currentColumnVal;
    const sheet = sheetRef;
    currentRow += 1;
    const currentCell = `${currentColumn}${currentRow}`;
    sheet.getCell(currentCell).value = 'TOTALS:';
    sheet.getCell(currentCell).fill = GenerateExcelBook.getCellFillColor('ffd891');

    ['totalTripsCompleted', 'totalTripsDeclined', 'totalTrips'].forEach((property) => {
      currentColumn = GenerateExcelBook.fnFillTotalColumns(
        sheetRef, currentRow, summary, currentColumn, property
      );
    });

    const range = `${startColumn}${currentRow}:
    ${String.fromCharCode(startColumn.charCodeAt(0) + 3)}${currentRow}`;

    sheet.getCell(range).font = { bold: true, name: 'Times New Roman' };
    return { currentRow, currentColumn };
  }

  static fnFillDataRows(sheetRef, currentRow, summary, currentCol, department, property) {
    const sheet = sheetRef;
    const currentColumn = Utils.nextAlphabet(currentCol);
    const currentCell = `${currentColumn}${currentRow}`;
    sheet.getCell(currentCell).value = summary.departments[department][property];
    return currentColumn;
  }

  static fnFillTotalColumns(sheetRef, currentRow, summary, currentCol, property) {
    const sheet = sheetRef;
    const currentColumn = Utils.nextAlphabet(currentCol);
    const currentCell = `${currentColumn}${currentRow}`;
    sheet.getCell(currentCell).value = summary[property];
    return currentColumn;
  }
}

export default GenerateExcelBook;
