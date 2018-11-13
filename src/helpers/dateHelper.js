class TimeElementGenerator {
  static getYearElement() {
    const thisYear = (new Date()).getFullYear();
    return {
      label: 'Year',
      type: 'select',
      name: 'new_year',
      placeholder: 'Year',
      options: [{
        label: thisYear,
        value: thisYear
      }, {
        label: thisYear + 1,
        value: thisYear + 1
      }]
    };
  }

  static getMonthElement() {
    const months = ['January',
      'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'];
    return {
      label: 'Month',
      type: 'select',
      name: 'new_month',
      placeholder: 'Month',
      options: months.map((month, index) => ({
        label: month,
        value: index,
      })),
    };
  }

  static getDateElement() {
    const options = [];
    for (let i = 1; i <= 31; i += 1) {
      options.push({
        label: i,
        value: i
      });
    }
    return {
      label: 'Date',
      type: 'select',
      name: 'new_date',
      placeholder: 'Date',
      options
    };
  }

  static getTime() {
    return ({
      label: 'Time',
      type: 'text',
      hint: 'hh:mm',
      placeholder: 'Time in 24 Hour format',
      name: 'time',
    });
  }
}

class dateDialogHelper {
  static generateDialogElements() {
    const elements = [
      TimeElementGenerator.getYearElement(),
      TimeElementGenerator.getMonthElement(),
      TimeElementGenerator.getDateElement(),
      TimeElementGenerator.getTime()
    ];
    return elements;
  }

  static dateChecker(userDateInput, timezoneOffset) {
    const dateInputTime = new Date(userDateInput).getTime();
    const now = new Date().getTime();
    const contextTimezoneOffset = new Date().getTimezoneOffset() * 60000;

    return dateInputTime - (now + contextTimezoneOffset + timezoneOffset * 1000);
  }
}

export default dateDialogHelper;
