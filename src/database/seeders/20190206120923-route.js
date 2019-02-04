const faker = require('faker');
const moment = require('moment');

const now = moment()
  .toISOString();

const updatedAt = now;
const createdAt = now;
const genFakerUser = (num, cap) => {
  const users = [];
  let routeBatchId = 0;

  for (let i = 0; i < num; i += 1) {
    if (i % cap === 0) {
      routeBatchId += 1;
    }
    users.push({
      name: faker.name.findName(),
      slackId: faker.random.uuid(),
      email: faker.internet.email(),
      routeBatchId,
      createdAt,
      updatedAt
    });
  }
  return users;
};

const genLocations = (num) => {
  const locations = [];
  for (let i = 0; i < num; i += 1) {
    locations.push({
      longitude: faker.address.longitude(),
      latitude: faker.address.latitude(),
      createdAt,
      updatedAt
    });
  }
  return locations;
};

const genAddresses = (num) => {
  const addresses = [];
  for (let i = 0; i < num; i += 1) {
    addresses.push({
      locationId: i + 1,
      address: faker.address.streetAddress(),
      createdAt,
      updatedAt
    });
  }
  return addresses;
};
const genRoutes = (num) => {
  const routes = [];
  for (let i = 0; i < num; i += 1) {
    routes.push({
      destinationId: i + 1,
      name: faker.address.streetName(),
      createdAt,
      updatedAt
    });
  }
  return routes;
};
const genRouteBatch = (num, cabSize, routeSize) => {
  const routes = [];
  for (let i = 0; i < num; i += 1) {
    const status = ['Inactive', 'Active'];
    routes.push({
      takeOff: '03:00',
      capacity: Math.floor(Math.random() * 6) + 4,
      status: status[Math.floor(Math.random() * 2)],
      comments: faker.lorem.sentence(),
      batch: faker.lorem.word()
        .substring(0, 1)
        .toUpperCase(),
      cabId: Math.floor(Math.random() * cabSize) + 1,
      routeId: Math.floor(Math.random() * routeSize) + 1,
      createdAt,
      updatedAt
    });
  }
  return routes;
};
const routeSize = 10;
module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Locations', genLocations(routeSize))
    .then(queryInterface.bulkInsert('Addresses', genAddresses(routeSize)))
    .then(() => queryInterface.bulkInsert('Routes', genRoutes(routeSize)))
    .then(() => queryInterface.bulkInsert('RouteBatches', genRouteBatch(100, 4, routeSize)))
    .then(() => queryInterface.bulkInsert('Users', genFakerUser(8, 3))),
  down: queryInterface => queryInterface.bulkDelete('Routes')
    .then(() => queryInterface.bulkDelete('RouteBatches'))
};
