const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const AddSubscription = async (dataObj) => {
    await client.connect();
    // I have no idea why I need dataObj.username.username but if I dont
    // I get the mongoDB entry of the username instead
    // Very weird
    console.log('Successfully connected to server, Subscriptions', dataObj.username.username, ' ', dataObj.streamerUsername)

    const db = client.db(dbName);
    const collection = db.collection('Users');
    collection.updateOne({username: dataObj.username.username}, {$addToSet:{subscriptions: dataObj.streamerUsername}})
        .catch((err) => {
            console.log(err)
        })
}

module.exports = AddSubscription