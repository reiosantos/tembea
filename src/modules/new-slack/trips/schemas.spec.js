import DateDialogHelper from '../../../helpers/dateHelper';
import Validators from '../../../helpers/slack/UserInputValidator/Validators';
import { userTripPickupSchema } from './schemas';

describe('schemas', () => {
  describe('userTripPickupSchema', () => {
    it('should validate when pickup is not others and othersPickup is undefined', () => {
      const test = {
        dateTime: DateDialogHelper.transformDate('22/12/2019 22:00'),
        pickup: 'Somewhere on Earth',
      };

      const result = Validators.validateSubmission(test, userTripPickupSchema);
      expect(result.dateTime).toBeDefined();
    });

    it('should not validate when pickup is not others and othersPickup is defined', () => {
      const test = {
        dateTime: DateDialogHelper.transformDate('22/12/2019 22:00'),
        pickup: 'Somewhere on Earth',
        othersPickup: 'Kigali'
      };

      try {
        const result = Validators.validateSubmission(test, userTripPickupSchema);
        expect(result).toBeUndefined();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.errors.details.length).toEqual(1);
      }
    });
  });
});
