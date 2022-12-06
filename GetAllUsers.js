const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const getAllUsers = async () => {
    await client.connect();
    console.log('Successfully connected to server')
    let ret = []
    const db = client.db(dbName);
    const collection = db.collection('Users');
    await collection.find().forEach((entry) => {
        console.log(entry)
        ret.push({
            username: entry.username,
            email: entry.email,
            profilePic: entry.profilePic,
            authorization: entry.authorization,
            subscriptions: entry.subscriptions
        })
    })
    // let salt = await collection.find({username: userObj.username}, {$exists: true}).next()
    // if(!salt) salt = await collection.find({email: userObj.username}, {$exists: true}).next()
    // if (salt != null) return salt.salt
    return ret
}

module.exports = getAllUsers;