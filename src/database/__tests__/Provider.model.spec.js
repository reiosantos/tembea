import {
  sequelize, dataTypes, checkModelName, checkPropertyExists
}
  from 'sequelize-test-helpers';
import Provider from '../models/provider';

describe('test provider model', () => {
  const Model = Provider(sequelize, dataTypes);
  const instance = new Model();
  checkModelName(Model)('Provider');

  describe('properties', () => {
    ['id', 'name', 'providerUserId'].forEach(checkPropertyExists(instance));
  });

  describe('check associations', () => {
    const User = 'some random user';
    const Cab = 'a random cab';
    beforeEach(() => {
      Model.associate({ User, Cab });
    });

    it('tests associations with Cabs and User models', () => {
      expect(Model.belongsTo.calledWith(User)).toEqual(true);
      expect(Model.hasMany.calledWith(Cab)).toEqual(true);
    });
  });
});
