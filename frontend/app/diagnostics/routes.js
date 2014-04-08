// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

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
