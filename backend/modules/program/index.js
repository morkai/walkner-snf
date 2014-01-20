'use strict';

var lodash = require('lodash');
var ProgramChanger = require('./ProgramChanger');

exports.DEFAULT_CONFIG = {
  modbusId: 'modbus'
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

  var masterStatusTag = 'masters.controlProcess';

  if (config.simulate || modbus.values[masterStatusTag])
  {
    init();
  }
  else
  {
    app.broker
      .subscribe('tagValueChanged.' + masterStatusTag, init)
      .setLimit(1);
  }

  function init()
  {
    module.programChanger = new ProgramChanger(app);
  }
};
