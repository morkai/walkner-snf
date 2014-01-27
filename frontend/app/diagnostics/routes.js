define([
  '../router',
  '../user',
  '../viewport',
  './pages/TagsPage',
  'i18n!app/nls/diagnostics'
], function(
  router,
  user,
  viewport,
  TagsPage
) {
  'use strict';

  var canView = user.auth('DIAGNOSTICS:VIEW');

  router.map('/diagnostics/tags', canView, function()
  {
    viewport.showPage(new TagsPage());
  });
});
