import DateDialogHelper from '../../dateHelper';

describe('dateHelpers', () => {
  describe('transform date', () => {
    it('should transform to iso format when no timezone', () => {
      const input = '30/06/2019 09:00';
      const dateValue = DateDialogHelper.transformDate(input);
      const expected = new Date(Date.UTC(2019, 5, 30, 9));
      expect(dateValue).toEqual(expected.toISOString());
    });

    it('should apply timezone difference when present', () => {
      const input = '30/06/2019 09:00';
      const dateValue = DateDialogHelper.transformDate(input, 'America/Los_Angeles');
      const expected = new Date(Date.UTC(2019, 5, 30, 2));
      expect(dateValue).toEqual(expected.toISOString());
    });

    it('should return null for invalid date', () => {
      const input = '32/23/2019 09:00';
      const dateValue = DateDialogHelper.transformDate(input, 'America/Los_Angeles');
      expect(dateValue).toEqual(null);
    });
  });
});
