import database from '..';

describe('sequelize', () => {
  it('should contain all the models', async () => {
    expect(database.models.User).toBeDefined();
    expect(database.models.Role).toBeDefined();
  });
});
