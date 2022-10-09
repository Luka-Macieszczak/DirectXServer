const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const login = async (userObj) => {
    await client.connect();
    console.log('Successfully connected to server')

    const db = client.db(dbName);
    const collection = db.collection('Users');

    let user = await collection.find({username: userObj.username}, {$exists: true}).next()
    if(user == null) user = await collection.find({email: userObj.username}, {$exists: true}).next()

    const userMatches = (userObj.username === user.email || userObj.username == user.username) && userObj.password == user.password;
    if(userMatches) return user
    else return null
}

module.exports = login