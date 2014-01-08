'use strict';

var crud = require('../express/crud');

module.exports = function setUpProgramsRoutes(app, programsModule)
{
  var express = app[programsModule.config.expressId];
  var userModule = app[programsModule.config.userId];
  var Program = app[programsModule.config.mongooseId].model('Program');

  var canManage = userModule.auth('PROGRAMS:MANAGE');

  express.get('/programs', crud.browseRoute.bind(null, app, Program));

  express.post('/programs', canManage, crud.addRoute.bind(null, app, Program));

  express.get('/programs/:id', crud.readRoute.bind(null, app, Program));

  express.put('/programs/:id', canManage, crud.editRoute.bind(null, app, Program));

  express.del('/programs/:id', canManage, crud.deleteRoute.bind(null, app, Program));
};
