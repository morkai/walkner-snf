// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var path = require('path');
var fs = require('fs');

module.exports = require('../createDictionaryModule')(
  'Program',
  require('./routes'),
  function(app, programsModule)
  {
    app.broker.subscribe('programs.deleted', function(message)
    {
      message.model.images.forEach(function(image)
      {
        fs.unlink(path.join(programsModule.config.imagesPath || './', image._id + '.' + image.type), function() {});
      });
    });

    app.broker.subscribe('programs.*.images.*', function()
    {
      var updater = app[programsModule.config.updaterId || 'updater'];

      if (updater)
      {
        updater.updateFrontendVersion();
      }
    });
  }
);
