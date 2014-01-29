'use strict';

exports.id = 'frontend';

exports.modules = [
  'mongoose',
  'events',
  'pubsub',
  'user',
  'express',
  'users',
  'programs',
  'tests',
  {id: 'messenger/client', name: 'messenger/client:controller'},
  'controller',
  'messenger/server',
  'httpServer',
  'httpsServer',
  'sio'
];

exports.events = {
  collection: function(app) { return app.mongoose.model('Event').collection; },
  insertDelay: 1000,
  topics: {
    debug: [
      'app.started',
      'users.login', 'users.logout',
      '*.added', '*.edited'
    ],
    info: [
      'events.**'
    ],
    warning: [
      'users.loginFailure',
      '*.deleted'
    ],
    error: [

    ]
  }
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 6080
};

exports.httpsServer = {
  host: '0.0.0.0',
  port: 6443,
  key: __dirname + '/privatekey.pem',
  cert: __dirname + '/certificate.pem'
};

exports.pubsub = {
  statsPublishInterval: 10000,
  republishTopics: [
    'events.saved',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'controller.tagsChanged', 'controller.tagValuesChanged'
  ]
};

exports.mongoose = {
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  uri: require('./mongodb').uri,
  options: {}
};

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'snf.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: null
  },
  cookieSecret: '1ee7\\/\\/snf',
  ejsAmdHelpers: {
    t: 'app/i18n',
    time: 'app/time'
  }
};

exports.user = {
  privileges: [
    'USERS:VIEW', 'USERS:MANAGE',
    'EVENTS:VIEW',
    'PROGRAMS:VIEW', 'PROGRAMS:MANAGE',
    'TESTS:VIEW',
    'DIAGNOSTICS:VIEW', 'DIAGNOSTICS:MANAGE'
  ]
};

exports['messenger/client:controller'] = {
  pubHost: '127.0.0.1',
  pubPort: 5050,
  repHost: '127.0.0.1',
  repPort: 5051,
  responseTimeout: 15000
};

exports.tests = {
  messengerClientId: 'messenger/client:controller'
};

exports.controller = {
  messengerClientId: 'messenger/client:controller'
};

exports['messenger/server'] = {
  pubHost: '0.0.0.0',
  pubPort: 5052,
  repHost: '0.0.0.0',
  repPort: 5053,
  broadcastTopics: ['programs.edited', 'programs.deleted']
};
