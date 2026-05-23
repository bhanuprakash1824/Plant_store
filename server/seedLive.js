/**
 * seedLive.js  —  Seeds the PRODUCTION (Render) MongoDB database
 *
 * HOW TO RUN:
 *   1. Open a terminal inside the `server` folder
 *   2. Run: node seedLive.js
 *
 * This script will:
 *   - Create the Owner account
 *   - Create a default Producer account
 *   - Insert 26 plants from the old ProductList data
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Plant = require('./models/Plant');

// ── All 26 plants from the original ProductList.jsx ──────────────────────────
const plantsData = [
  // Air Purifying Plants
  { name: 'Snake Plant', category: 'Air Purifying Plants', description: 'Can filter indoor air, even at night.', image: 'https://cdn.pixabay.com/photo/2021/01/22/06/04/snake-plant-5939187_1280.jpg', price: 15, stock: 20 },
  { name: 'Spider Plant', category: 'Air Purifying Plants', description: 'Filters formaldehyde and xylene from the air.', image: 'https://cdn.pixabay.com/photo/2018/07/11/06/47/chlorophytum-3530413_1280.jpg', price: 12, stock: 20 },
  { name: 'Peace Lily', category: 'Air Purifying Plants', description: 'Removes mold spores and purifies the air.', image: 'https://cdn.pixabay.com/photo/2019/06/12/14/14/peace-lilies-4269365_1280.jpg', price: 18, stock: 20 },
  { name: 'Boston Fern', category: 'Air Purifying Plants', description: 'Adds humidity to the air and removes toxins.', image: 'https://cdn.pixabay.com/photo/2020/04/30/19/52/boston-fern-5114414_1280.jpg', price: 15, stock: 20 },
  { name: 'Rubber Plant', category: 'Air Purifying Plants', description: 'Easy to care for and effective at removing toxins.', image: 'https://cdn.pixabay.com/photo/2020/02/15/11/49/flower-4850729_1280.jpg', price: 17, stock: 20 },
  { name: 'Aloe Vera', category: 'Air Purifying Plants', description: 'Purifies the air and has healing properties for skin.', image: 'https://cdn.pixabay.com/photo/2018/04/02/07/42/leaf-3283175_1280.jpg', price: 14, stock: 20 },

  // Aromatic Fragrant Plants
  { name: 'Lavender', category: 'Aromatic Fragrant Plants', description: 'Calming scent, used in aromatherapy.', image: 'https://images.unsplash.com/photo-1611909023032-2d6b3134ecba?q=80&w=1074&auto=format&fit=crop', price: 20, stock: 15 },
  { name: 'Jasmine', category: 'Aromatic Fragrant Plants', description: 'Sweet fragrance, promotes relaxation.', image: 'https://images.unsplash.com/photo-1592729645009-b96d1e63d14b?q=80&w=1170&auto=format&fit=crop', price: 18, stock: 15 },
  { name: 'Rosemary', category: 'Aromatic Fragrant Plants', description: 'Invigorating scent, often used in cooking.', image: 'https://cdn.pixabay.com/photo/2019/10/11/07/12/rosemary-4541241_1280.jpg', price: 15, stock: 15 },
  { name: 'Mint', category: 'Aromatic Fragrant Plants', description: 'Refreshing aroma, used in teas and cooking.', image: 'https://cdn.pixabay.com/photo/2016/01/07/18/16/mint-1126282_1280.jpg', price: 12, stock: 15 },
  { name: 'Lemon Balm', category: 'Aromatic Fragrant Plants', description: 'Citrusy scent, calming and stress-relieving.', image: 'https://cdn.pixabay.com/photo/2019/09/16/07/41/balm-4480134_1280.jpg', price: 14, stock: 15 },
  { name: 'Hyacinth', category: 'Aromatic Fragrant Plants', description: 'Highly fragrant flowers, perfect for spring.', image: 'https://cdn.pixabay.com/photo/2019/04/07/20/20/hyacinth-4110726_1280.jpg', price: 16, stock: 15 },

  // Insect Repellent Plants
  { name: 'Oregano', category: 'Insect Repellent Plants', description: 'Repels aphids and spider mites naturally.', image: 'https://cdn.pixabay.com/photo/2015/05/30/21/20/oregano-790702_1280.jpg', price: 10, stock: 25 },
  { name: 'Marigold', category: 'Insect Repellent Plants', description: 'Repels a variety of garden pests.', image: 'https://cdn.pixabay.com/photo/2022/02/22/05/45/marigold-7028063_1280.jpg', price: 8, stock: 25 },
  { name: 'Geraniums', category: 'Insect Repellent Plants', description: 'Known to repel mosquitoes and other insects.', image: 'https://cdn.pixabay.com/photo/2012/04/26/21/51/flowerpot-43270_1280.jpg', price: 12, stock: 25 },
  { name: 'Basil', category: 'Insect Repellent Plants', description: 'Repels flies and mosquitoes.', image: 'https://cdn.pixabay.com/photo/2016/08/22/07/56/basil-1611909_1280.jpg', price: 9, stock: 25 },

  // Medicinal Plants
  { name: 'Echinacea', category: 'Medicinal Plants', description: 'Boosts the immune system and fights infections.', image: 'https://cdn.pixabay.com/photo/2014/12/05/01/21/echinacea-557477_1280.jpg', price: 16, stock: 20 },
  { name: 'Peppermint', category: 'Medicinal Plants', description: 'Relieves headaches and digestive issues.', image: 'https://cdn.pixabay.com/photo/2017/07/12/12/23/peppermint-2496773_1280.jpg', price: 13, stock: 20 },
  { name: 'Lemon Grass', category: 'Medicinal Plants', description: 'Used in teas to aid digestion and relieve anxiety.', image: 'https://cdn.pixabay.com/photo/2019/02/08/07/43/lemon-grass-3982868_1280.jpg', price: 14, stock: 20 },
  { name: 'Chamomile', category: 'Medicinal Plants', description: 'Calming herb known for promoting sleep.', image: 'https://cdn.pixabay.com/photo/2016/08/19/19/48/flowers-1606041_1280.jpg', price: 15, stock: 20 },

  // Low Maintenance Plants
  { name: 'ZZ Plant', category: 'Low Maintenance Plants', description: 'Thrives in low light and requires minimal watering.', image: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?q=80&w=464&auto=format&fit=crop', price: 18, stock: 30 },
  { name: 'Pothos', category: 'Low Maintenance Plants', description: 'Tolerates neglect and can grow in various conditions.', image: 'https://cdn.pixabay.com/photo/2018/11/15/10/32/plants-3816945_1280.jpg', price: 14, stock: 30 },
  { name: 'Cast Iron Plant', category: 'Low Maintenance Plants', description: 'Hardy plant that survives low light and infrequent watering.', image: 'https://cdn.pixabay.com/photo/2017/02/16/18/04/cast-iron-plant-2072008_1280.jpg', price: 20, stock: 30 },
  { name: 'Succulents', category: 'Low Maintenance Plants', description: 'Drought-tolerant plants that store water in their leaves.', image: 'https://cdn.pixabay.com/photo/2016/11/21/16/05/cacti-1846158_1280.jpg', price: 10, stock: 30 },
  { name: 'Aglaonema', category: 'Low Maintenance Plants', description: 'Tolerates low light and infrequent watering.', image: 'https://cdn.pixabay.com/photo/2014/10/10/04/27/aglaonema-482915_1280.jpg', price: 22, stock: 30 },
  { name: 'Dracaena', category: 'Low Maintenance Plants', description: 'Adaptable and tolerant of varying light conditions.', image: 'https://cdn.pixabay.com/photo/2017/02/16/18/04/cast-iron-plant-2072008_1280.jpg', price: 16, stock: 30 },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB (Live)...');

    // 1. Create Owner account
    const ownerEmail = process.env.OWNER_EMAIL || 'owner@eplant.com';
    const ownerPassword = process.env.OWNER_PASSWORD || 'Owner@1234';
    let owner = await User.findOne({ email: ownerEmail });
    if (!owner) {
      owner = await User.create({ name: 'Platform Owner', email: ownerEmail, password: ownerPassword, role: 'owner' });
      console.log(`✅ Owner created: ${ownerEmail} / ${ownerPassword}`);
    } else {
      console.log(`ℹ️  Owner already exists: ${ownerEmail}`);
    }

    // 2. Create default Producer account
    const producerEmail = 'producer@eplant.com';
    let producer = await User.findOne({ email: producerEmail });
    if (!producer) {
      producer = await User.create({
        name: 'Paradise Default Farms',
        businessName: 'Paradise Nursery',
        email: producerEmail,
        password: 'Password@123',
        phone: '+91 98765 43210',
        role: 'producer',
      });
      console.log(`✅ Producer created: ${producerEmail} / Password@123`);
    } else {
      console.log(`ℹ️  Producer already exists: ${producerEmail}`);
    }

    // 3. Insert plants
    let inserted = 0;
    for (const p of plantsData) {
      const exists = await Plant.findOne({ name: p.name });
      if (!exists) {
        await Plant.create({ ...p, producer: producer._id, version: 0 });
        inserted++;
      }
    }
    console.log(`✅ Inserted ${inserted} new plants (${plantsData.length - inserted} already existed)`);

    await mongoose.disconnect();
    console.log('\n🎉 Live database seeded successfully!');
    console.log('-----------------------------------');
    console.log('Owner Login:    owner@eplant.com / Owner@1234');
    console.log('Producer Login: producer@eplant.com / Password@123');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
