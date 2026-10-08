// Handles the connection to MongoDB Atlas using Mongoose.
const mongoose = require('mongoose');

const connectDB = async () => {
  // Accept either MONGODB_URI (preferred) or MONGO_URI for compatibility.
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('MongoDB connection error: MONGODB_URI is not set. Add it to backend/.env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
