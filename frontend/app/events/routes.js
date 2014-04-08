// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  '../router',
  '../viewport',
  '../user',
  './pages/EventListPage'
], function(
  router,
  viewport,
  user,
  EventListPage
) {
  'use strict';

  router.map('/events', user.auth('EVENTS:VIEW'), function(req)
  {
    viewport.showPage(new EventListPage({rql: req.rql}));
  });
});
