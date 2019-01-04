import requestCall from 'supertest';
import app from '../../../app';
import Utils from '../../../utils';
import MonthlyReportSender from '../../../helpers/email/monthlyReportSender';

const summary = {
  month: 'Dec, 2018',
  totalTrips: 4,
  totalTripsDeclined: 1,
  totalTripsCompleted: 3,
  departments:
    {
      People: { completed: 1, declined: 0, total: 1 },
      'Pre-Fellowship': { completed: 2, declined: 0, total: 2 },
      Finance: { completed: 0, declined: 1, total: 1 }
    },
  percentageChange: '50.00'
};

const dataFields = {
  name: 'Rio Santos',
  month: summary.month,
  departments: Utils.chunkArray(MonthlyReportSender.departmentToArray(summary.departments), 2),
  summary
};

describe('Email template endpoint', () => {
  it('should get email template', (done) => {
    requestCall(app)
      .get('/api/v1/template/email/report')
      .send(dataFields)
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end((err, res) => {
        expect(res.text).toContain('div');
        expect(res.text).toContain('Hello, Rio Santos!');
        expect(res.text).toContain('Here is a summary of trips taken in Dec, 2018');
        done();
      });
  });
});
