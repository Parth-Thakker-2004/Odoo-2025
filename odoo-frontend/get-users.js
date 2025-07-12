const { MongoClient } = require('mongodb');

async function getUsers() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('odoo_frontend');
  const users = await db.collection('users').find({}, { projection: { _id: 1, name: 1, email: 1 } }).toArray();
  console.log('Users in database:');
  users.forEach(user => console.log(JSON.stringify({ id: user._id.toString(), name: user.name, email: user.email })));
  await client.close();
}

getUsers().catch(console.error);
