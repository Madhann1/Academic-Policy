const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const imports = [
  { file: 'academicpolicy.users.json',          collection: 'users' },
  { file: 'academicpolicy.policies.json',       collection: 'policies' },
  { file: 'academicpolicy.policyversions.json', collection: 'policyversions' },
  { file: 'academicpolicy.requests.json',       collection: 'requests' },
];

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas\n');

    const db = client.db('academicpolicy');

    for (const { file, collection } of imports) {
      const filePath = path.join(__dirname, file);
      const raw = fs.readFileSync(filePath, 'utf8');

      // Parse and convert Extended JSON ($oid, $date) to native types
      const docs = JSON.parse(raw, (key, value) => {
        if (value && typeof value === 'object') {
          if (value.$oid)  return value.$oid;   // keep as string id
          if (value.$date) return new Date(value.$date);
        }
        return value;
      });

      const col = db.collection(collection);
      await col.deleteMany({});  // clear existing docs
      const result = await col.insertMany(docs);
      console.log(`📦 ${collection}: inserted ${result.insertedCount} document(s)`);
    }

    console.log('\n✅ All collections imported successfully into "academicpolicy" database on Atlas!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.close();
  }
}

run();
