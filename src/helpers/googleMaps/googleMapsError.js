export default class GoogleMapsError extends Error {
  static get UNAUTHENTICATED() {
    return 401;
  }

  static get UNKNOWN_ERROR() {
    return 402;
  }

  constructor(code, message) {
    super(message);
    this.code = code;
  }
}
