const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  const retryDelay = 3000; // 3 seconds

  const connect = async () => {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/razite-db';
      
await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log('✅ Connected to MongoDB');
      retries = 0; // Reset retries on successful connection
      return true;
    } catch (error) {
      retries++;
      console.error(`❌ MongoDB connection failed (${retries}/${maxRetries}):`, error.message);
      
      if (retries < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return connect();
      } else {
        console.error('❌ Max retries reached. Please ensure MongoDB is running or update MONGODB_URI in .env');
        console.error('📌 For MongoDB Atlas setup, use: mongodb+srv://<user>:<password>@cluster.mongodb.net/razite-db?retryWrites=true&w=majority');
        // Don't exit - allow API to run in mock mode
        return false;
      }
    }
  };

  return connect();
};

module.exports = connectDB;
