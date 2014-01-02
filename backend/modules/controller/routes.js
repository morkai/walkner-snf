'use strict';

var lodash = require('lodash');

module.exports = function startTagsRoutes(app, controllerModule)
{
  var express = app[controllerModule.config.expressId];
  var user = app[controllerModule.config.userId];

  var canView = user.auth();

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
