const moment = require('moment');

moment.updateLocale('en', {
  weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
});

class Utils {
  static formatDate(dateStr) {
    const date = new Date(dateStr);
    return moment(date).format('ddd, MMM Do YYYY hh:mm a');
  }

  static getPreviousMonth() {
    return moment().date(0).format('MMM, YYYY');
  }

  static formatDateForDatabase(dateStr) {
    const date = new Date(dateStr);
    return moment(date).format('YYYY-MM-DD HH:mm:ss');
  }

  static nextAlphabet(firstChar) {
    const char = firstChar.toUpperCase();
    return String.fromCharCode(char.charCodeAt(0) + 1);
  }
}

module.exports = Utils;
