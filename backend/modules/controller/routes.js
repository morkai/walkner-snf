// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var lodash = require('lodash');

module.exports = function startTagsRoutes(app, controllerModule)
{
  var express = app[controllerModule.config.expressId];
  var user = app[controllerModule.config.userId];

  var canView = user.auth('DIAGNOSTICS:VIEW');

  express.get('/tags', canView, browseRoute);

  /**
   * @private
   * @param {object} req
   * @param {object} res
   */
  function browseRoute(req, res)
  {
    var tags = lodash.values(controllerModule.tags);

    res.send({
      totalCount: tags.length,
      collection: tags
    });
  }
};
