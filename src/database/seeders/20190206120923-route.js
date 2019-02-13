const faker = require('faker');
const moment = require('moment');

const now = moment()
  .toISOString();

const updatedAt = now;
const createdAt = now;

const genLocations = (num) => {
  const locations = [];
  for (let i = 0; i < num; i += 1) {
    locations.push({
      id: 1001 + i,
      longitude: faker.address.longitude(),
      latitude: faker.address.latitude(),
      createdAt,
      updatedAt
    });
  }
  return locations;
};

const genAddresses = (num) => {
  const locations = genLocations(num);
  const addresses = [];
  for (let i = 0; i < num; i += 1) {
    addresses.push({
      id: 1001 + i,
      locationId: locations[i].id,
      address: faker.address.streetAddress(),
      createdAt,
      updatedAt
    });
  }
  return {
    addresses,
    locations
  };
};

const genRoutes = (num) => {
  const result = genAddresses(num);
  const { addresses, locations } = result;
  const routes = [];
  for (let i = 0; i < num; i += 1) {
    routes.push({
      id: 1001 + i,
      destinationId: addresses[i].id,
      name: faker.address.streetName(),
      createdAt,
      updatedAt
    });
  }
  return {
    addresses,
    locations,
    routes
  };
};

const genRouteBatch = (num, cabSize, routeSize) => {
  const routes = [];
  const map = {};
  const baseCode = 64;

  for (let i = 0; i < num; i += 1) {
    const id = 1001 + i;
    const routeId = Math.floor(Math.random() * routeSize) + 1001;
    const routeMappedValues = map[`${routeId}`];
    if (!routeMappedValues) {
      map[`${routeId}`] = [];
    }
    map[`${routeId}`].push(id);

    const batch = String.fromCharCode(baseCode + map[`${routeId}`].length);

    routes.push({
      id,
      takeOff: '03:00',
      inUse: 0,
      capacity: Math.floor(Math.random() * 4) + 4,
      status: 'Active',
      comments: faker.lorem.sentence(),
      batch,
      cabId: Math.floor(Math.random() * cabSize) + 1,
      routeId,
      createdAt,
      updatedAt
    });
  }
  return routes;
};

const genFakerUser = (userSize, batchSize, cabSize, routeSize) => {
  const routeBatches = genRouteBatch(batchSize, cabSize, routeSize);
  const copy = [...routeBatches];
  const [routeBatchs] = copy.splice(0, 1);
  const users = [];
  let userIdCount = 1001;
  routeBatches[0].inUse = routeBatchs.capacity;
  for (let i = 0; i < routeBatchs.capacity; i += 1) {
    userIdCount += i;
    users.push({
      id: userIdCount,
      name: faker.name.findName(),
      slackId: faker.random.uuid(),
      email: faker.internet.email(),
      routeBatchId: routeBatchs.id,
      createdAt,
      updatedAt
    });
  }
  userIdCount += routeBatchs.capacity;

  const map = {};
  const totalCapacity = routeBatches
    .map(batch => batch.capacity)
    .reduce((a, b) => a + b);
  const num = Math.min(totalCapacity, userSize);
  for (let i = 0; i < num; i += 1) {
    if (!copy.length) break;
    const currBatchIndex = Math.floor(Math.random() * copy.length);
    const routeBatch = copy[currBatchIndex];
    const routeBatchId = copy[currBatchIndex].id;
    const routeUser = map[`${routeBatchId}`];
    if (!routeUser) {
      map[`${routeBatchId}`] = [];
    }
    if (map[`${routeBatchId}`].length < routeBatch.capacity) {
      map[`${routeBatchId}`].push(`${1001 + i}`);
      routeBatch.inUse = map[`${routeBatchId}`].length;
      userIdCount += i;
      users.push({
        id: userIdCount,
        name: faker.name.findName(),
        slackId: faker.random.uuid(),
        email: faker.internet.email(),
        routeBatchId,
        createdAt,
        updatedAt
      });
    } else {
      i -= 1;
      copy.splice(currBatchIndex, 1);
    }
  }
  return {
    routeBatches,
    users
  };
};

const routeSize = 8;
const { addresses, locations, routes } = genRoutes(routeSize);
const { users, routeBatches } = genFakerUser(50, 25, 4, routeSize);
module.exports = {
  up: queryInterface => queryInterface.bulkInsert('Locations', locations)
    .then(queryInterface.bulkInsert('Addresses', addresses))
    .then(() => queryInterface.bulkInsert('Routes', routes))
    .then(() => queryInterface.bulkInsert('RouteBatches', routeBatches))
    .then(() => queryInterface.bulkInsert('Users', users)),
  down: queryInterface => queryInterface.bulkDelete('Routes')
    .then(() => queryInterface.bulkDelete('RouteBatches'))
};
