import requestCall from 'supertest';
import app from '../src/app';
import Utils from '../src/utils';
import { createRouteUseRecords, createBatchUseRecords } from './support/helpers';
import { routeUseRecords, batchUseRecords } from './__mocks__';
import RouteStatistics from '../src/services/RouteStatistics';
import RouteController from '../src/modules/routes/RouteController';

describe('Route Statistics', () => {
  let validToken;
  const from = '2018-01-01';
  const to = '2019-12-31';
  const invalidDate = '2017-12-31';
  const badDateFormat = '2';

  beforeEach(async () => {
    validToken = Utils.generateToken('30m', { userInfo: { rules: ['admin'] } });
    await createRouteUseRecords(routeUseRecords);
    await createBatchUseRecords(batchUseRecords);
  });

  it('integration test: should return first 5 top frequent and least 5 frequent riders', async () => {
    const result = await requestCall(app)
      .get(`/api/v1/routes/statistics/riders?from=${from}&to=${to}`)
      .set('Authorization', validToken)
      .set('homebaseid', 1)
      .expect(200);

    const { message, success, data } = JSON.parse(result.text);

    expect(success).toBe(true);
    expect(message).toBe('data retrieved successfully');
    expect(data).toHaveProperty('firstFiveMostFrequentRiders');
    expect(data).toHaveProperty('leastFiveFrequentRiders');
    expect(Array.isArray(data.firstFiveMostFrequentRiders)).toBe(true);
    expect(Array.isArray(data.leastFiveFrequentRiders)).toBe(true);
  });

  it('integration test: should return validation errors when start date format is not valid', async () => {
    const result = await requestCall(app)
      .get(`/api/v1/routes/statistics/riders?from=${badDateFormat}&to=${to}`)
      .set('Authorization', validToken)
      .set('homebaseid', 1)
      .expect(400);

    const { message, success, error } = JSON.parse(result.text);

    expect(success).toBe(false);
    expect(message).toBe('Validation error occurred, see error object for details');
    expect(error).toHaveProperty(
      'from',
      '"from" must be a string with one of the following formats [YYYY-MM-DD]'
    );
  });

  it('integration test: should return validation errors when homebase id is not provided', async () => {
    const result = await requestCall(app)
      .get(`/api/v1/routes/statistics/riders?from=${from}&to=${to}`)
      .set('Authorization', validToken)
      .expect(400);

    const { message, success } = JSON.parse(result.text);

    expect(success).toBe(false);
    expect(message).toBe(
      'homebaseid is required in the header and must be a postive interger value'
    );
  });
  it('integration test: should return validation errors when homebase id is not an integer', async () => {
    const result = await requestCall(app)
      .get(`/api/v1/routes/statistics/riders?from=${from}&to=${to}`)
      .set('Authorization', validToken)
      .set('homebaseid', 'u')
      .expect(400);

    const { message, success } = JSON.parse(result.text);

    expect(success).toBe(false);
    expect(message).toBe(
      'homebaseid is required in the header and must be a postive interger value'
    );
  });

  it('integration test: should return validation errors when start date and end date are not passed', async () => {
    const result = await requestCall(app)
      .get('/api/v1/routes/statistics/riders')
      .set('Authorization', validToken)
      .set('homebaseid', 1)
      .expect(400);

    const { message, success, error } = JSON.parse(result.text);

    expect(success).toBe(false);
    expect(message).toBe('Validation error occurred, see error object for details');
    expect(error).toHaveProperty('from', 'Please provide from');
    expect(error).toHaveProperty('from', 'Please provide from');
  });

  it('integration test: should return validation errors when to is lower than from', async () => {
    const result = await requestCall(app)
      .get(`/api/v1/routes/statistics/riders?from=${from}&to=${invalidDate}`)
      .set('Authorization', validToken)
      .set('homebaseid', 1)
      .expect(400);

    const { message, success, error } = JSON.parse(result.text);

    expect(success).toBe(false);
    expect(message).toBe('Validation error occurred, see error object for details');
    expect(error).toHaveProperty('to');
  });

  it('integration test: should return validation errors when to is not valid', async () => {
    const result = await requestCall(app)
      .get(`/api/v1/routes/statistics/riders?from=${from}&to=${badDateFormat}`)
      .set('Authorization', validToken)
      .set('homebaseid', 1)
      .expect(400);

    const { message, success, error } = JSON.parse(result.text);

    expect(success).toBe(false);
    expect(message).toBe('Validation error occurred, see error object for details');
    expect(error).toHaveProperty('to', '"to" must be a string with one of the following formats [YYYY-MM-DD]');
  });

  it('integration test: should return an error in catch block', async () => {
    jest
      .spyOn(RouteStatistics, 'getTopAndLeastFrequentRiders')
      .mockRejectedValue(new Error('some error'));

    const req = {
      query: {
        from: '2018-01-01',
        to: '2019-12-31'
      },
      headers: { homebaseid: 1 }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await RouteController.getRouteStatistics(req, res);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'some error'
    });
  });
});
