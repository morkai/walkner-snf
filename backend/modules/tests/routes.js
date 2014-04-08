// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var ObjectId = require('mongodb').ObjectID;
var crud = require('../express/crud');

module.exports = function setUpTestsRoutes(app, testsModule)
{
  var express = app[testsModule.config.expressId];
  var Test = app[testsModule.config.mongooseId].model('Test');

  express.get('/tests', programObjectId, crud.browseRoute.bind(null, app, Test));

  express.get('/tests/:id', crud.readRoute.bind(null, app, Test));

  function programObjectId(req, res, next)
  {
    req.rql.selector.args.forEach(function(term)
    {
      if (term.name === 'eq' && term.args[0] === 'program')
      {
        term.args[0] = 'program._id';
        term.args[1] = new ObjectId(term.args[1]);
      }
    });

    next();
  }
};
