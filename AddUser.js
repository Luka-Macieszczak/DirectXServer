const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'webdevfinal';

const addUser = async (userObj) => {
    await client.connect();
    console.log('Successfully connected to server')

    const db = client.db(dbName);
    const collection = db.collection('Users');
    let userExists = await collection.find({username: userObj.username}, {$exists: true}).next() != null
    userExists = await collection.find({email: userObj.email}, {$exists: true}).next() != null

    let result;

    if(!userExists){
        result = await collection.insertOne({
            username: userObj.username, 
            password: userObj.password,
            email: userObj.email,
            salt: userObj.salt,
            subscriptions:[],
            profilePic:'https://fomantic-ui.com/images/wireframe/white-image.png',
            authorization: 'default'    
        })
        console.log(result);
    }
    return result
}

module.exports = addUser