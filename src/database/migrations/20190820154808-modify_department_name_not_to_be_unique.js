module.exports = {
  up: (queryInterface) => queryInterface.removeConstraint('Departments', 'Departments_name_key')
    .then(() => queryInterface.removeIndex('Departments', 'Departments_name_key')),
  down: (queryInterface) => queryInterface.addIndex('Departments', ['name'], {
    indexName: 'Departments_name_key',
    indicesType: 'UNIQUE'
  })
};
