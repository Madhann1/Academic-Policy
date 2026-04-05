const { MongoClient } = require('mongodb');
require('dotenv').config();

const LOCAL_URI  = 'mongodb://127.0.0.1:27017/academicpolicy';
const ATLAS_URI  = process.env.MONGO_URI; // academicpolicy db on Atlas

async function migrate() {
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    await localClient.connect();
    await atlasClient.connect();
    console.log('✅ Connected to both Local and Atlas\n');

    const localDB = localClient.db('academicpolicy');
    const atlasDB = atlasClient.db('academicpolicy');

    // Get all collections from local
    const collections = await localDB.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections in local DB:\n`);

    for (const { name } of collections) {
      const docs = await localDB.collection(name).find({}).toArray();
      if (docs.length === 0) {
        console.log(`⏭️  ${name}: skipped (empty)`);
        continue;
      }
      await atlasDB.collection(name).deleteMany({});  // clear old data
      const result = await atlasDB.collection(name).insertMany(docs);
      console.log(`📦 ${name}: ${result.insertedCount} document(s) migrated`);
    }

    console.log('\n✅ Migration complete! All collections are now on Atlas.');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();
