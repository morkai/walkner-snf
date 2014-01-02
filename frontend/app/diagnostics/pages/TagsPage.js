define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../TagsCollection',
  '../views/TagsView',
  'i18n!app/nls/users'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  View,
  TagsCollection,
  TagsView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'tags',

    breadcrumbs: [
      t.bound('diagnostics', 'BREADCRUMBS:diag'),
      t.bound('diagnostics', 'BREADCRUMBS:tags')
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    defineModels: function()
    {
      this.collection = bindLoadingMessage(new TagsCollection(), this);
    },

    defineViews: function()
    {
      this.view = new TagsView({
        collection: this.collection
      });
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    }

  });
});
