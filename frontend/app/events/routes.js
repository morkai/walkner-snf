// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

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
