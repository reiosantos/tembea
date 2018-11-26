import { config } from 'dotenv';
import ScheduleTripController from '../ScheduleTripController';
import dateHelper from '../../../../helpers/dateHelper';

config();

jest.mock('@slack/client', () => ({
  WebClient: jest.fn(() => ({
    chat: { postMessage: jest.fn(() => Promise.resolve(() => {})) },
    users: {
      info: jest.fn(() => Promise.resolve({
        user: { real_name: 'someName', profile: { } }, token: 'sdf'
      })),
      profile: {
        get: jest.fn(() => Promise.resolve({
          profile: { tz_offset: 'someValue', email: 'sekito.ronald@andela.com' }
        }))
      }
    }
  })),
}));

const currentTimezoneOffset = new Date().getTimezoneOffset() * 60 * -1;
const yesterday = `${new Date(new Date().getTime() - 86400000).toLocaleDateString('en-us')} 12:00`;
const tomorrow = `${new Date(new Date().getTime() + 86400000).toLocaleDateString('en-us')} 12:00`;

// nocking hack by @barak for slack api call for users info
ScheduleTripController.fetchUserInformationFromSlack = () => ({
  tz_offset: currentTimezoneOffset,
  profile: { email: 'sekito.ro.andela.com' },
  real_name: 'ender'
});

const payload = {
  submission: {
    pickup: 'Entebe',
    destination: 'Gabon',
    date_time: yesterday
  },
  user: { id: '1', name: 'myName' }
};

describe('ScheduleTripController', () => {
  describe('dateChecker', () => {
    it('should get the years', () => {
      const res = dateHelper.generateDialogElements();

      expect(res.length).toEqual(4);
    });
  });

  describe('Run Validations', () => {
    it('should return an empty array if no errors exist', async (done) => {
      payload.submission.date_time = tomorrow;
      const errors = await ScheduleTripController.runValidations(payload);
      expect(errors).toHaveLength(0);
      done();
    });
    it('should return two errors if pickup location and destination are the same', async (done) => {
      payload.submission.pickup = 'Gabon';
      const errors = await ScheduleTripController.runValidations(payload);
      expect(errors).toHaveLength(2);
      done();
    });
    it('should return "Only alphabets, dashes and spaces are allowed." when any location contains a number', async (done) => {
      payload.submission.pickup = 'Entebe2';
      payload.submission.destination = 'Gabon2';
      const errors = await ScheduleTripController.runValidations(payload);
      expect(errors[0].error).toEqual('Only alphabets, dashes and spaces are allowed.');
      expect(errors[1].error).toEqual('Only alphabets, dashes and spaces are allowed.');
      done();
    });
    it('should return "Date cannot be in the past." when date is in the past', async (done) => {
      payload.submission = {
        pickup: 'Entebe',
        destination: 'Gabon',
        date_time: yesterday
      };
      const errors = await ScheduleTripController.runValidations(payload);
      expect(errors[0].error).toEqual('Date cannot be in the past.');
      done();
    });
    it('should return "Time format must be in Month/Day/Year format. See hint."', async (done) => {
      payload.submission.date_time = '31/2/218 1:00am';
      const errors = await ScheduleTripController.runValidations(payload);
      expect(errors[0].error).toEqual('Time format must be in Month/Day/Year format. See hint.');
      done();
    });
  });

  describe('fetchUserInformationFromSlack', () => {
    it('should return a object containing users profile', async (done) => {
      const user = await ScheduleTripController.fetchUserInformationFromSlack(payload.user.id);
      expect(user.tz_offset).toEqual(currentTimezoneOffset);
      done();
    });
  });
});

describe('createRequest method', () => {
  const payloadWithRider = {
    user: {
      id: '1',
      name: 'sekito',
    },
    submission: {
      pickup: 'pickUpLocation',
      date_time: '12/12/2018 12:12',
      destination: 'myHome'
    }
  };

  it('should create a trip request', async (done) => {
    await ScheduleTripController.createRequest(payload);

    done();
  });

  it('should create a trip request for someone', async (done) => {
    await ScheduleTripController.createRequest(payloadWithRider);

    done();
  });
});
