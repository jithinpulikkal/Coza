
const mongoose = require('mongoose');

mongoose.set('strictQuery',false)
// Connection URL
const url = process.env.MONGO_URL;

// Connect to MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));
