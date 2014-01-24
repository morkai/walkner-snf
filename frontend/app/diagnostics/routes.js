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

  var canViewSettings = user.auth(['DIAGNOSTICS:VIEW', 'SETTINGS:VIEW']);

  router.map('/diagnostics/tags', canViewSettings, function()
  {
    viewport.showPage(new TagsPage());
  });
});
