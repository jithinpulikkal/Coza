
const mongoose = require('mongoose');

mongoose.set('strictQuery',false)
// Connection URL
const url = "mongodb://127.0.0.1:27017/web";

// Connect to MongoDB
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));
