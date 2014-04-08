// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var setUpRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user'
};

exports.start = function startProgramsModule(app, module, done)
{
  module.models = [];

  module.models.byId = {};

  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpRoutes.bind(null, app, module)
  );

  app.onModuleReady(module.config.mongooseId, function()
  {
    app.broker.subscribe('programs.added', cacheModels);
    app.broker.subscribe('programs.edited', cacheModels);
    app.broker.subscribe('programs.deleted', cacheModels);

    cacheModels(done);
  });

  function cacheModels(done)
  {
    var Program = app[module.config.mongooseId].model('Program');

    Program.find().sort({name: 1}).exec(function(err, programs)
    {
      if (err)
      {
        module.error("Failed to cache programs: %s", err.stack);
      }
      else
      {
        module.models = programs;

        module.models.byId = {};

        programs.forEach(function(program)
        {
          module.models.byId[program.get('_id')] = program;
        });
      }

      if (typeof done === 'function')
      {
        done(err);
      }
    });
  }
};
