// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  pubsubId: 'pubsub',
  sioId: 'sio',
  messengerClientId: 'messenger/client'
};

exports.start = function startTestsModule(app, module)
{
  module.currentTest = null;

  module.lastTest = null;

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(module.config.sioId, setUpCommands.bind(null, app, module));

  app.onModuleReady(
    [
      module.config.pubsubId
    ],
    function()
    {
      app.broker.subscribe('tests.started', onTestStarted);
      app.broker.subscribe('tests.finished', onTestFinished);
    }
  );

  app.broker.subscribe('messenger.client.connected', function(message)
  {
    if (message.socketType === 'req' && message.moduleName === module.config.messengerClientId)
    {
      app[module.config.messengerClientId].request('tests.getData', null, function(testData)
      {
        if (testData.currentTest)
        {
          onTestStarted(testData.currentTest);
        }
        else
        {
          onTestFinished(testData.lastTest);
        }
      });
    }
  });

  function onTestStarted(test)
  {
    module.currentTest = test;

    app[module.config.pubsubId].publish('tests.started', test);
  }

  function onTestFinished(testId)
  {
    module.currentTest = null;

    app[module.config.mongooseId].model('Test').findById(testId, {tags: 0}, function(err, test)
    {
      if (err)
      {
        return module.error("Failed to find a finished test: %s", err.message);
      }

      if (test)
      {
        module.lastTest = test.toJSON();
      }
      else
      {
        module.warn("Couldn't find a finished test: %s", testId);
      }

      app[module.config.pubsubId].publish('tests.finished', test ? module.lastTest : null);
    });
  }
};
