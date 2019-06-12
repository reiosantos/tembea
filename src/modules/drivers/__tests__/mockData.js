export const mockData = {
  _options: { isNewRecord: true },
  dataValues: {
    driverName: 'Muhwezi Deo2',
    driverPhoneNo: '0705331111',
    driverNumber: 'UB5422424344',
    providerId: 1
  }
};
export const createReq = {
  body: {
    driverName: 'Muhwezi Deo2',
    driverNumber: 'UB5422424344',
    driverPhoneNo: '0705331111',
    providerId: 1
  }
};
export const expected = {
  driverName: 'Muhwezi Deo2',
  driverNumber: 'UB5422424344',
  driverPhoneNo: '0705331111',
  providerId: 1
};
export const existingUserMock = {
  _options: { isNewRecord: false },
  dataValues: {}
};
export const drivers = {
  driverName: 'Muhwezi Deo2',
  driverNumber: 'UB5422424344',
  driverPhoneNo: '0705331111',
  providerId: 1
};
