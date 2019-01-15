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
    return [
      TimeElementGenerator.getYearElement(),
      TimeElementGenerator.getMonthElement(),
      TimeElementGenerator.getDateElement(),
      TimeElementGenerator.getTime()
    ];
  }

  static dateChecker(userDateInput, timezoneOffset) {
    // change date format to mm/dd/yyyy
    const newDate = this.changeDateFormat(userDateInput);

    const dateInputTime = new Date(newDate).getTime();
    const now = new Date().getTime();
    const contextTimezoneOffset = new Date().getTimezoneOffset() * 60000;

    return dateInputTime - (now + contextTimezoneOffset + (timezoneOffset * 1000));
  }

  static dateFormat(date) {
    const dateFormat = new RegExp(
      '^(0?[1-9]|[12]\\d|3[0-1])[/]([1-9]|[0-1][0-2])[/][2][0][0-9]{2}[ ][0-2]?[0-9][:][0-5][0-9]$'
    );
    return dateFormat.test(date);
  }

  static changeDateFormat(date) {
    const [day, month, yearAndTime] = date.split('/');
    return `${month}/${day}/${yearAndTime}`;
  }
}

export default DateDialogHelper;
