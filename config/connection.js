const createError = require('http-errors');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const url = process.env.MONGO_URL;

mongoose.connect(url, {
  serverSelectionTimeoutMS: 10000
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function ensureDbConnection() {
  if (!isDbConnected()) {
    throw createError(503, 'Database connection unavailable. Check MongoDB network access and Atlas allowlist.');
  }
}

module.exports = {
  connection: mongoose.connection,
  ensureDbConnection,
  isDbConnected
};
