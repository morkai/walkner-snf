// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './Test',
  './TestCollection',
  './pages/TestListPage',
  './pages/TestDetailsPage',
  'i18n!app/nls/snf-tests'
], function(
  router,
  viewport,
  user,
  Test,
  TestCollection,
  TestListPage,
  TestDetailsPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'USER');

  router.map('/tests', canView, function(req)
  {
    viewport.showPage(new TestListPage({
      collection: new TestCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/tests/:id', canView, function(req)
  {
    viewport.showPage(new TestDetailsPage({
      model: new Test({_id: req.params.id})
    }));
  });
});
