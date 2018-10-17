// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var http = require('http');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  pubsubId: 'pubsub',
  sioId: 'sio',
  messengerClientId: 'messenger/client',
  controllerId: 'controller'
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
    if (!testId)
    {
      return;
    }

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

        if (test.result)
        {
          printLabel(module.lastTest._id.toString(), 1);
        }
      }
      else
      {
        module.warn("Couldn't find a finished test: %s", testId);
      }

      app[module.config.pubsubId].publish('tests.finished', test ? module.lastTest : null);
    });
  }

  setTimeout(printLabel, 1337);

  function printLabel(requestId, tryNo)
  {
    var controller = app[module.config.controllerId];
    var remoteServerUrl = controller.values.remoteServerUrl;
    var prodLine = controller.values.prodLine;

    if (!remoteServerUrl || !prodLine)
    {
      return;
    }

    var req = http.request({
      host: remoteServerUrl,
      port: 80,
      path: '/xiconf/hidLamps;printLabel',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    req.on('error', function(err)
    {
      module.error('Failed to print label: %s', err.message);

      retryPrintLabel(requestId, tryNo);
    });

    req.on('response', function(res)
    {
      if (res.statusCode !== 200)
      {
        module.error('Failed to print label: unexpected status code: %s', res.statusCode);

        return retryPrintLabel(requestId, tryNo);
      }

      var body = '';

      res.setEncoding('utf8');
      res.on('data', function(chunk)
      {
        body += chunk;
      });
      res.on('end', function()
      {
        try
        {
          body = JSON.parse(body);
        }
        catch (err)
        {
          module.error('Failed to print label: invalid response body: %s', err.message);

          return retryPrintLabel(requestId, tryNo);
        }

        module.info('Printed label: %s', JSON.stringify(body));
      });
    });

    req.end(JSON.stringify({
      line: prodLine,
      orderNo: null,
      serialNo: null
    }));
  }

  function retryPrintLabel(requestId, tryNo)
  {
    if (tryNo < 2)
    {
      setTimeout(printLabel, 1000, requestId, tryNo + 1);
    }
  }
};
