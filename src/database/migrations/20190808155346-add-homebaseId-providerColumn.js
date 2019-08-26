module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.sequelize.query(`
  select id from "Homebases" where name='Nairobi'
  `).then((res) => {
    const { id } = res[0][0];
    return queryInterface.addColumn('Providers', 'homebaseId', {
      type: Sequelize.INTEGER,
      defaultValue: id,
      references: {
        model: 'Homebases',
        key: 'id',
        as: 'homebase'
      },
    });
  }),
  down: (queryInterface) => queryInterface.removeColumn('Providers', 'homebaseId')
};
