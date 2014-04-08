// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/router',
  'app/viewport',
  './pages/DashboardPage',
  'i18n!app/nls/dashboard'
], function(
  router,
  viewport,
  DashboardPage
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new DashboardPage());
  });
});
