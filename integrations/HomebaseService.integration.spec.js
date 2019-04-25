import HomebaseService from '../src/services/HomebaseService';
import models from '../src/database/models';

describe('create Homebase', () => {
  afterAll(() => {
    models.sequelize.close();
  });
  it('should create a homebase', async () => {
    const testHomebase = {
      homebaseName: 'Jinja',
      countryId: 11
    };
    const { homebaseName, countryId } = testHomebase;
    const result = await HomebaseService.createHomebase(homebaseName, countryId);
    const { homebase } = result;
    expect(homebase.countryId).toEqual(11);
    expect(homebase.deletedAt).toEqual(null);
    expect(homebase.name).toEqual('Jinja');
  });
});
