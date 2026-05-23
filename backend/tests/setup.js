const { sequelize } = require('../src/models');

beforeAll(async () => {
  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

global.testRequest = require('supertest');