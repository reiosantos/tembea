import CleanData from '../cleanData';

describe('Clean Data', () => {
  const data = {
    name: ' sokool',
    email: ' paula@gmail.com',
    locations: [{ location: ' Uganda ' }, { location: ' Kampala ' }],
    details: { firstName: '  soko ', lastName: ' paul ' }
  };
  const result = {
    name: 'sokool',
    email: 'paula@gmail.com',
    locations: [{ location: 'Uganda' }, { location: 'Kampala' }],
    details: { firstName: 'soko', lastName: 'paul' }
  };
  describe('trim ', () => {
    it('should fail if time format does not match requirement', () => {
      const output = CleanData.trim(data);
      expect(output).toEqual(result);
    });
  });
});
