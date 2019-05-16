// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  '../broker',
  '../router',
  '../viewport',
  './pages/LogInFormPage',
  './util/userInfoPopover',
  'i18n!app/nls/users'
], function(
  broker,
  router,
  viewport,
  LogInFormPage
) {
  'use strict';

  router.map('/login', function(req)
  {
    broker.publish('router.navigate', {
      url: '/',
      replace: true,
      trigger: false
    });

    viewport.showPage(new LogInFormPage({
      model: {unknown: req.query.unknown}
    }));
  });
});
