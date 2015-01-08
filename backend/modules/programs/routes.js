// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

module.exports = function setUpProgramsRoutes(app, programsModule)
{
  var express = app[programsModule.config.expressId];
  var userModule = app[programsModule.config.userId];
  var Program = app[programsModule.config.mongooseId].model('Program');

  var canManage = userModule.auth('PROGRAMS:MANAGE');

  express.get('/programs', express.crud.browseRoute.bind(null, app, Program));

  express.post('/programs', canManage, express.crud.addRoute.bind(null, app, Program));

  express.get('/programs/:id', express.crud.readRoute.bind(null, app, Program));

  express.put('/programs/:id', canManage, express.crud.editRoute.bind(null, app, Program));

  express.delete('/programs/:id', canManage, express.crud.deleteRoute.bind(null, app, Program));
};
