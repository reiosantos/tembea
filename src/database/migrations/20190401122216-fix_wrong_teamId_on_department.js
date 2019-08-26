
module.exports = {
  up: (queryInterface) => {
    if (process.env.NODE_ENV === 'production') {
      queryInterface.sequelize.query(`
        UPDATE "Departments" SET "teamId" = 'T02R3LKBA'
        WHERE "Departments"."teamId" = 'TE2K8PGF8';`);
    }
    return Promise.resolve();
  },

  down: () => Promise.resolve()
};
