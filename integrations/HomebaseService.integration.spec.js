import HomebaseService from '../src/services/HomebaseService';
import models from '../src/database/models';
import { createCountry } from './support/helpers';
import faker from 'faker';

describe('create Homebase', () => {
  let country;
  beforeAll(async () => {
    country = await createCountry({ name: faker.address.country().concat('rand') });
  });

  afterAll(() => {
    models.sequelize.close();
  });

  it('should create a homebase', async () => {
    const testHomebase = {
      homebaseName: faker.address.county().concat('rand'),
      countryId: country.id,
      channel: 'UPOIUJ'
    };
    const { homebaseName, countryId, channel } = testHomebase;
    const result = await HomebaseService.createHomebase(homebaseName, countryId, channel);


    const { homebase } = result;

    expect(homebase.deletedAt).toEqual(null);
    expect(homebase.countryId).toEqual(countryId);
    expect(homebase.name).toEqual(testHomebase.homebaseName);
  });
});
