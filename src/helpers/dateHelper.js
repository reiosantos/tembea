class TimeElementGenerator {
  static getYearElement() {
    const thisYear = new Date().getFullYear();
    return {
      label: 'Year',
      type: 'select',
      name: 'newYear',
      placeholder: 'Year',
      options: [
        {
          label: thisYear,
          value: thisYear
        },
        {
          label: thisYear + 1,
          value: thisYear + 1
        }
      ]
    };
  }

  static getMonthElement() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];
    return {
      label: 'Month',
      type: 'select',
      name: 'newMonth',
      placeholder: 'Month',
      options: months.map((month, index) => ({
        label: month,
        value: index
      }))
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
      name: 'newDate',
      placeholder: 'Date',
      options
    };
  }

  static getTime() {
    return {
      label: 'Time',
      type: 'text',
      hint: 'hh:mm',
      placeholder: 'Time in 24 Hour format',
      name: 'time'
    };
  }
}

class DateDialogHelper {
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
    // change date format to mm/dd/yyyy
    const date = userDateInput.split(/\//);
    const newDate = [date[1], date[0], date[2]].join('/');

    const dateInputTime = new Date(newDate).getTime();
    const now = new Date().getTime();
    const contextTimezoneOffset = new Date().getTimezoneOffset() * 60000;

    return dateInputTime - (now + contextTimezoneOffset + timezoneOffset * 1000);
  }

  static dateFormat(date) {
    const dateFormat = /^([1-9]|([012][0-9])|(3[01]))[/]([0]{0,1}[1-9]|1[012])[/]\d\d\d\d [012]{0,1}[0-9]:[0-6][0-9]$/;
    return dateFormat.test(date);
  }
}

export default DateDialogHelper;
