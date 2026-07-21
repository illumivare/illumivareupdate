import mongoose from 'mongoose';

/**
 * Connects to MongoDB Atlas using Mongoose.
 * Provides production-ready error handling and connection status logs.
 */
export const connectDB = async () => {
  const mongoUrl = process.env.MONGODB_URI;

  if (!mongoUrl) {
    console.error('Error: MONGODB_URI is not set in the environment variables.');
    // In production, we should fail gracefully or exit depending on system design.
    // For this app, we will let requests fail on execution rather than crashing the whole server on load.
    return null;
  }

  try {
    // Connect to MongoDB Atlas with optimal Mongoose settings
    const conn = await mongoose.connect(mongoUrl, {
      // Modern Mongoose versions manage connection pools and parser defaults automatically,
      // but we handle connection events below for full monitoring.
    });

    console.log(`MongoDB Atlas Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Failed to connect to MongoDB Atlas: ${error.message}`);
    return null;
  }
};

// Monitor connection events for production visibility
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
});
