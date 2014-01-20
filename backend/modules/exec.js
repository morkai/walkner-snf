'use strict';

var exec = require('child_process').exec;

exports.DEFAULT_CONFIG = {
  cmd: null,
  afterAppStarted: false
};

exports.start = function startExecModule(app, module)
{
  if (module.config.afterAppStarted)
  {
    app.broker.subscribe('app.started', runCmd).setLimit(1);
  }
  else
  {
    runCmd();
  }

  function runCmd()
  {
    [].concat(module.config.cmd).forEach(function(cmd)
    {
      if (typeof cmd === 'string')
      {
        exec(cmd, function(err)
        {
          if (err)
          {
            module.error(err.message);
          }
        });
      }
    });
  }
};
