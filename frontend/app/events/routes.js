// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  'i18n!app/nls/events'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  router.map('/events', user.auth('EVENTS:VIEW'), function(req)
  {
    viewport.loadPage('app/events/pages/EventListPage', function(EventListPage)
    {
      return new EventListPage({rql: req.rql});
    });
  });
});
