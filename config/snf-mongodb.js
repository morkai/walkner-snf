'use strict';

module.exports = {
  uri: process.env.SNF_MONGODB_URI || 'mongodb://127.0.0.1:27017/walkner-snf',
  keepAliveQueryInterval: 15000,
  mongoClient: {
    poolSize: 5,
    autoReconnect: true,
    noDelay: true,
    keepAlive: 1000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 0,
    reconnectTries: Number.MAX_SAFE_INTEGER,
    reconnectInterval: 1000,
    forceServerObjectId: false,
    w: 1,
    wtimeout: 5000,
    promiseLibrary: global.Promise,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
};

if (process.env.SNF_MONGODB_REPLICA_SET)
{
  module.exports.mongoClient.replicaSet = process.env.SNF_MONGODB_REPLICA_SET;
}
