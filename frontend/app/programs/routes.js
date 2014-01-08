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
  './views/ProgramFormView',
  'app/programs/templates/details',
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
  ProgramFormView,
  detailsTemplate
) {
  'use strict';

  var canView = user.auth('PROGRAMS:VIEW');
  var canManage = user.auth('PROGRAMS:MANAGE');

  router.map('/programs', canView, function(req)
  {
    viewport.showPage(new ProgramListPage({rql: req.rql}));
  });

  router.map('/programs/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      detailsTemplate: detailsTemplate,
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
