import HomebaseService from '../src/services/HomebaseService';
import models from '../src/database/models';
import { createCountry } from './support/helpers';
import faker from 'faker';



describe('create Homebase', () => {
  afterAll(() => {
    models.sequelize.close();
  });

  it('should create a homebase', async () => {
    const country = await createCountry({ name: faker.address.country() });
    const testHomebase = {
      homebaseName: 'Salvador',
      countryId: country.id
    };
    const { homebaseName, countryId } = testHomebase;
    const result = await HomebaseService.createHomebase(homebaseName, countryId);
    const { homebase } = result;
    expect(homebase.countryId).toEqual(testHomebase.countryId);
    expect(homebase.deletedAt).toEqual(null);
    expect(homebase.name).toEqual('Salvador');
  });
});
