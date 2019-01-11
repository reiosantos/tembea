import AddressService from '../AddressService';

describe('AddressService', () => {
  describe('createNewAddress', () => {
    it('should raise error when having invalid parameters', async (done) => {
      try {
        await AddressService.createNewAddress(1);
      } catch (error) {
        expect(error.message).toBe('Could not create address');
      }
      done();
    });
  });

  describe('updateNewAddress', () => {
    it('should raise error when having invalid parameters', async (done) => {
      try {
        await AddressService.updateAddress();
      } catch (error) {
        expect(error.message).toBe('Could not update address record');
      }
      done();
    });
  });

  describe('findAddress', () => {
    it('should raise error when having invalid parameters', async (done) => {
      try {
        await AddressService.findAddress(1);
      } catch (error) {
        expect(error.message).toBe('Could not find address record');
      }
      done();
    });
  });
});
