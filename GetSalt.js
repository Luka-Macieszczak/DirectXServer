const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const getSalt = async (userObj) => {
    await client.connect();
    console.log('Successfully connected to server')

    const db = client.db(dbName);
    const collection = db.collection('Users');

    let salt = await collection.find({username: userObj.username}, {$exists: true}).next()
    if(!salt) salt = await collection.find({email: userObj.username}, {$exists: true}).next()
    if (salt != null) return salt.salt
    else return null
}

module.exports = getSalt;