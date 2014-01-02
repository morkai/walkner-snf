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

  var canView = user.auth('DIAGNOSTICS_VIEW');
  var canViewSettings = user.auth(['DIAGNOSTICS_VIEW', 'SETTINGS_VIEW']);

  router.map('/diagnostics/tags', canViewSettings, function()
  {
    viewport.showPage(new TagsPage());
  });
});
