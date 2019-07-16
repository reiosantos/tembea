import NewSlackHelpers from './slack-helpers';
import tripPaymentSchema from '../trips/schemas';

describe('dialogValidator', () => {
  it('should validate data from a dialog', () => {
    const data = { price: 200 };
    const validate = NewSlackHelpers.dialogValidator(data, tripPaymentSchema);
    expect(validate).toBeDefined();
    expect(validate).toEqual(data);
  });

  it('Should not validate data: Validation fail', () => {
    const data = { price: 'test' };
    try {
      NewSlackHelpers.dialogValidator(data, tripPaymentSchema);
    } catch (err) {
      expect(err.errors).toBeDefined();
      expect(err.errors[0].name).toEqual('price');
    }
  });
});
