// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var lodash = require('lodash');
var Watchdog = require('./Watchdog');
var ProgramManager = require('./ProgramManager');
var TestManager = require('./TestManager');

exports.DEFAULT_CONFIG = {
  modbusId: 'modbus',
  messengerServerId: 'messenger/server'
};

exports.start = function startProgramModule(app, module)
{
  var modbus = app[module.config.modbusId];

  if (!modbus)
  {
    throw new Error("modbus module is required!");
  }

  var config = module.config;
  var execQueue = null;

  module.exec = function(func, name)
  {
    if (execQueue === null)
    {
      execQueue = {};

      process.nextTick(function()
      {
        var queue = execQueue;

        execQueue = null;

        lodash.each(queue, function(func) { func(); });
      });
    }

    execQueue[name || func.name] = func;
  };

  app.onModuleReady(module.config.messengerServerId, function()
  {
    app[module.config.messengerServerId].handle('tests.getData', function(data, reply)
    {
      if (module.testManager)
      {
        reply({
          currentTest: module.testManager.currentTest,
          lastTest: module.testManager.lastTest
        });
      }
      else
      {
        reply({
          currentTest: null,
          lastTest: null
        });
      }
    });
  });

  var masterStatusTag = 'masters.controlProcess';
  var initProgramSub = null;

  if (config.simulate || modbus.values[masterStatusTag])
  {
    initWatchdog();
  }
  else
  {
    app.broker
      .subscribe('tagValueChanged.' + masterStatusTag, initWatchdog)
      .setLimit(1);
  }

  function initWatchdog()
  {
    module.watchdog = new Watchdog(app);

    if (modbus.values['watchdog'])
    {
      return initProgram();
    }

    initProgramSub = app.broker.subscribe('tagValueChanged.watchdog', initProgram);
  }

  function initProgram(message)
  {
    if (!message || message.newValue)
    {
      if (initProgramSub)
      {
        initProgramSub.cancel();
        initProgramSub = null;
      }

      module.programManager = new ProgramManager(app);
      module.testManager = new TestManager(app);
    }
  }
};
