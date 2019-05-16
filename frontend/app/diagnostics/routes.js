// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/user',
  'app/controller',
  'app/diagnostics/pages/TagsPage',
  'i18n!app/nls/diagnostics'
], function(
  router,
  viewport,
  user,
  controller,
  TagsPage
) {
  'use strict';

  var canView = user.auth('USER');

  router.map('/diagnostics/tags', canView, function()
  {
    viewport.showPage(new TagsPage({
      model: controller
    }));
  });
});
