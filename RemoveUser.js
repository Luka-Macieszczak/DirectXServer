const {MongoClient} = require('mongodb');
const catchEm = require('./catchEm');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const removeUser = async (user) => {
    await client.connect()

    const db = client.db(dbName);
    const collection = db.collection('Users');

    console.log(user)

    let [err, res] = await catchEm(collection.deleteOne({username: user.username}))
    if(err) {
        console.log(err)
    } else {
        console.log(res + "deleted");
    }
}

module.exports = removeUser;