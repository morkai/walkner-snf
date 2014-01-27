define([
  '../router',
  '../viewport',
  '../user',
  './pages/TestListPage',
  './pages/TestDetailsPage',
  './Test',
  'i18n!app/nls/tests'
], function(
  router,
  viewport,
  user,
  TestListPage,
  TestDetailsPage,
  Test
) {
  'use strict';

  var canViewTests = user.auth('TESTS:VIEW');

  function canView(req, referer, next)
  {
    if (user.data.local)
    {
      next();
    }
    else
    {
      canViewTests(req, referer, next);
    }
  }

  router.map('/tests', canView, function(req)
  {
    viewport.showPage(new TestListPage({rql: req.rql}));
  });

  router.map('/tests/:id', canView, function(req)
  {
    viewport.showPage(new TestDetailsPage({
      model: new Test({_id: req.params.id})
    }));
  });
});
