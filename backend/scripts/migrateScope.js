const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecosphere');
  console.log('MongoDB connected');

  const db = mongoose.connection.db;
  const result = await db.collection('carbontransactions').updateMany(
    { scope: { $exists: false } },
    { $set: { scope: 'scope_1' } }
  );
  console.log(`Updated ${result.modifiedCount} documents — set missing scope to 'scope_1'`);

  const counts = await db.collection('carbontransactions').aggregate([
    { $group: { _id: '$scope', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Scope distribution:');
  counts.forEach(c => console.log(`  ${c._id || 'null'}: ${c.count}`));

  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
