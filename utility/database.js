const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const connectionString = process.env.CONNECTION_STRING;

let _db;

const mongoConnect = (callback) => {

    MongoClient.connect(connectionString)
        .then(client =>{
            console.log("connected");
            _db = client.db;
            callback();
        })
        .catch(err => {
            console.log(err);
            throw err;
        })

}

const getdb = () => {
    if(_db) {
        return _db;
    }
    throw 'No Database';    
}

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;