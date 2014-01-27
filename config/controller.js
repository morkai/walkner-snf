'use strict';

exports.id = 'controller';

exports.modules = [
  'mongoose',
  'events',
  'modbus',
  'messenger/server',
  {id: 'messenger/client', name: 'messenger/client:frontend'},
  'program'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  userId: null,
  expressId: null,
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started'
    ],
    info: [
      'events.**'
    ],
    success: [

    ],
    error: [

    ]
  },
  print: ['modbus.error']
};

exports['messenger/server'] = {
  pubHost: '0.0.0.0',
  pubPort: 5050,
  repHost: '0.0.0.0',
  repPort: 5051,
  broadcastTopics: ['events.saved', 'tests.started', 'tests.finished']
};

exports['messenger/client:frontend'] = {
  pubHost: '127.0.0.1',
  pubPort: 5052,
  repHost: '127.0.0.1',
  repPort: 5053,
  responseTimeout: 15000
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {}
};

exports.program = {

};

exports.modbus = {
  dbId: 'mongoose',
  settingsCollection: function(app) { return app.mongoose.connection.db.collection('settings'); },
  writeAllTheThings: 'sim',
  maxReadQuantity: 25,
  ignoredErrors: [
    'ECONNREFUSED',
    'EHOSTUNREACH',
    'ResponseTimeout'
  ],
  broadcastFilter: ['health'],
  controlMasters: ['sim'],
  masters: {
    sim: {
      defaultTimeout: 100,
      interval: 100,
      suppressTransactionErrors: true,
      transport: {
        type: 'ip',
        connection: {
          type: 'tcp',
          host: '127.0.0.1',
          port: 502,
          noActivityTime: 2000
        }
      }
    }
  },
  tagsFile: __dirname + '/tags.csv',
  tags: {}
};
