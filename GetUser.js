const {MongoClient} = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const GetUser = async (username) => {
    await client.connect()

    const db = client.db(dbName);
    const collection = db.collection('Users');

    let user = await collection.find({username: username}, {$exists: true}).next()
    if (user != null) return {username: user.username, profilePic: user.profilePic}
}

module.exports = GetUser;