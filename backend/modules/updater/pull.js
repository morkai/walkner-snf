// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var exec = require('child_process').exec;

module.exports = function(options, done)
{
  var cmd = '"' + options.gitExe + '" pull';

  exec(cmd, {cwd: options.cwd, timeout: 30000}, function(err, stdout, stderr)
  {
    done(err, {stdout: stdout, stderr: stderr});
  });
};
