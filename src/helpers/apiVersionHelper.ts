import { Request } from 'express';
export default class ApiVersionHelper {
  static getApiVersion(req: Request) {
    const version = req.originalUrl.split('/')[2];
    return version ? version.toLowerCase() : version;
  }
}
