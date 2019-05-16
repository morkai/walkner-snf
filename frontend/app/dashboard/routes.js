// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/router',
  'app/viewport',
  './pages/DashboardPage',
  'i18n!app/nls/dashboard'
], function(
  user,
  router,
  viewport,
  DashboardPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'USER'), function()
  {
    viewport.showPage(new DashboardPage());
  });
});
