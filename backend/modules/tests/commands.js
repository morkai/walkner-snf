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
