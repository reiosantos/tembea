import HomebaseService from '../src/services/HomebaseService';
import models from '../src/database/models';
import { createCountry } from './support/helpers';

describe('create Homebase', () => {
  let country;
  beforeAll(async () => {
    country = await createCountry({ name: 'Tanzania' });
  });

  afterAll(() => {
    models.sequelize.close();
  });

  it('should create a homebase', async () => {
    const testHomebase = {
      homebaseName: 'Mombasa',
      countryId: country.id,
      channel: 'UPOIUJ'
    };
    const { homebaseName, countryId, channel } = testHomebase;
    const result = await HomebaseService.createHomebase(homebaseName, countryId, channel);


    const { homebase } = result;

    expect(homebase.deletedAt).toEqual(null);
    expect(homebase.countryId).toEqual(countryId);
    expect(homebase.name).toEqual('Mombasa');
  });
});
