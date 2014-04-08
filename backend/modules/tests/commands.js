// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var lodash = require('lodash');

module.exports = function setUpTestsCommands(app, testsModule)
{
  app[testsModule.config.sioId].sockets.on('connection', function(socket)
  {
    socket.on('tests.getData', function getData(reply)
    {
      if (lodash.isFunction(reply))
      {
        reply({
          currentTest: testsModule.currentTest,
          lastTest: testsModule.lastTest
        });
      }
    });
  });
};
