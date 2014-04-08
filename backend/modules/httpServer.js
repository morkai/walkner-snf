// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var util = require('util');
var http = require('http');
var domain = require('domain');

exports.DEFAULT_CONFIG = {
  expressId: 'express',
  host: '0.0.0.0',
  port: 80
};

exports.start = function startHttpServerModule(app, module, done)
{
  function onFirstServerError(err)
  {
    if (err.code === 'EADDRINUSE')
    {
      return done(new Error(util.format(
        "port %d already in use?", module.config.port
      )));
    }
    else
    {
      return done(err);
    }
  }

  var serverDomain = domain.create();

  serverDomain.run(function()
  {
    app.httpServer = http.createServer(function onRequest(req, res)
    {
      var reqDomain = domain.create();

      reqDomain.add(req);
      reqDomain.add(res);

      reqDomain.on('error', function onRequestError(err)
      {
        if (err.code !== 'ECONNRESET')
        {
          module.error(err.message);
        }

        reqDomain.dispose();
      });

      var express = app[module.config.expressId];

      if (express)
      {
        express(req, res);
      }
      else
      {
        res.send(503);
      }
    });

    app.httpServer.once('error', onFirstServerError);

    app.httpServer.listen(module.config.port, module.config.host, function()
    {
      app.httpServer.removeListener('error', onFirstServerError);

      module.debug("Listening on port %d...", module.config.port);

      return done();
    });
  });
};
