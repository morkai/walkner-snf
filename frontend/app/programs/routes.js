// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  '../router',
  '../viewport',
  '../user',
  './Program',
  './ProgramCollection',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  '../core/pages/ActionFormPage',
  './pages/ProgramListPage',
  './views/ProgramDetailsView',
  './views/ProgramFormView',
  'i18n!app/nls/programs'
], function(
  router,
  viewport,
  user,
  Program,
  ProgramCollection,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  ActionFormPage,
  ProgramListPage,
  ProgramDetailsView,
  ProgramFormView
) {
  'use strict';

  var canView = user.auth('PROGRAMS:VIEW');
  var canManage = user.auth('PROGRAMS:MANAGE');

  router.map('/programs', canView, function(req)
  {
    viewport.showPage(new ProgramListPage({
      collection: new ProgramCollection({rqlQuery: req.rql})
    }));
  });

  router.map('/programs/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: ProgramDetailsView,
      model: new Program({_id: req.params.id})
    }));
  });

  router.map('/programs;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: ProgramFormView,
      model: new Program()
    }));
  });

  router.map('/programs/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: ProgramFormView,
      model: new Program({_id: req.params.id})
    }));
  });

  router.map('/programs/:id;delete', canManage, function(req, referer)
  {
    var model = new Program({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });
});
