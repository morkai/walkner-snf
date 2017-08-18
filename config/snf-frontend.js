'use strict';

const mongodb = require('./snf-mongodb');

exports.id = 'snf-frontend';

exports.modules = [
  'updater',
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
  'sio'
];

exports.mainJsFile = 'snf-main.js';
exports.mainCssFile = 'assets/snf-main.css';

exports.dictionaryModules = {
  programs: 'PROGRAMS'
};

exports.updater = {
  manifestPath: null,
  packageJsonPath: __dirname + '/../package.json',
  restartDelay: 10000,
  pull: {
    exe: 'git.exe',
    cwd: __dirname + '/../',
    timeout: 30000
  },
  versionsKey: 'snf'
};

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
  },
  blacklist: []
};

exports.httpServer = {
  host: '0.0.0.0',
  port: 6080
};

exports.sio = {
  httpServerIds: ['httpServer'],
  socketIo: {
    pingInterval: 10000,
    pingTimeout: 5000
  }
};

exports.pubsub = {
  statsPublishInterval: 60000,
  republishTopics: [
    'events.saved',
    'updater.newVersion',
    '*.added', '*.edited', '*.deleted', '*.synced',
    'controller.tagsChanged', 'controller.tagValuesChanged',
    'programs.*.images.*'
  ]
};

exports.mongoose = {
  uri: mongodb.uri,
  options: mongodb,
  maxConnectTries: 10,
  connectAttemptDelay: 500,
  models: ['event', 'user', 'test', 'program']
};

exports.express = {
  staticPath: __dirname + '/../frontend',
  staticBuildPath: __dirname + '/../frontend-build',
  sessionCookieKey: 'snf.sid',
  sessionCookie: {
    httpOnly: true,
    path: '/',
    maxAge: 3600 * 24 * 30 * 1000
  },
  sessionStore: {
    touchInterval: 3600 * 8 * 1000,
    touchChance: 0
  },
  cookieSecret: '1ee7\\/\\/snf',
  ejsAmdHelpers: {
    t: 'app/i18n',
    time: 'app/time'
  },
  textBody: {limit: '15mb'},
  jsonBody: {limit: '4mb'}
};

exports.user = {
  localAddresses: [/^192\.168\./],
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

exports.programs = {
  imagesPath: __dirname + '/../data/uploads/programs'
};
