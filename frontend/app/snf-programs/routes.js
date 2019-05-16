// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/pages/FilteredListPage',
  './Program',
  './ProgramCollection',
  'app/snf-programs/pages/DetailsPage',
  'app/snf-programs/views/FilterView',
  'app/snf-programs/views/ListView',
  'i18n!app/nls/snf-programs'
], function(
  router,
  viewport,
  user,
  FilteredListPage,
  Program,
  ProgramCollection,
  DetailsPage,
  FilterView,
  ListView
) {
  'use strict';

  var canView = user.auth('LOCAL', 'SNF:VIEW');

  router.map('/programs', canView, function(req)
  {
    viewport.showPage(new FilteredListPage({
      FilterView: FilterView,
      ListView: ListView,
      actions: [],
      collection: new ProgramCollection(null, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/programs/:id', canView, function(req)
  {
    viewport.showPage(new DetailsPage({
      model: new Program({_id: req.params.id})
    }));
  });
});
