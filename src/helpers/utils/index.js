import moment from 'moment';

class Utils {
  static formatDate(dateStr) {
    moment.updateLocale('en', {
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    });
    const date = new Date(dateStr);

    return moment(date).format('ddd, MMM Do YYYY hh:mm');
  }
}

export default Utils;
