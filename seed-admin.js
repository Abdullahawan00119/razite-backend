
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await Admin.findOne({ email: 'admin@razite.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }

    const admin = new Admin({
      email: 'admin@razite.com',
      password: 'admin123',
      name: 'System Admin',
      role: 'super-admin'
    });

    await admin.save();
    console.log('Admin created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
