export default class TripHelper {
  static cleanDateQueryParam(query, field) {
    if (query[field]) {
      // departureTime sample data => after,2018-10-10;before,2018-01-10
      const [a, b] = query[field].split(';');
      return this.extracted222(a, b);
    }
  }

  static extracted222(a, b) {
    const result = {};
    const [key1, value1] = this.extracted(a || '');
    if (key1) {
      result[key1] = value1;
    }

    const [key2, value2] = this.extracted(b || '');
    if (key2) {
      result[key2] = value2;
    }
    return result;
  }

  static extracted(a) {
    const [key, value] = a.split(':');
    if (key) {
      return [key, value];
    }
    return [];
  }
}
