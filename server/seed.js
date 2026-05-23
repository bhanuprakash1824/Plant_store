const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  const ownerEmail = process.env.OWNER_EMAIL || 'owner@eplant.com';
  const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@1234';

  const existing = await User.findOne({ email: ownerEmail });
  if (existing) {
    console.log(`✅ Owner already exists: ${ownerEmail}`);
    await mongoose.disconnect();
    return;
  }

  await User.create({
    name: 'Platform Owner',
    email: ownerEmail,
    password: ownerPassword,
    role: 'owner',
  });

  console.log(`✅ Owner account created: ${ownerEmail} / ${ownerPassword}`);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
