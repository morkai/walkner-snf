define([
  'jquery',
  'app/viewport',
  'app/i18n',
  'app/core/util/bindLoadingMessage',
  'app/core/View',
  '../TestCollection',
  '../views/TestListView',
  '../views/TestFilterView',
  'app/tests/templates/listPage'
], function(
  $,
  viewport,
  t,
  bindLoadingMessage,
  View,
  TestCollection,
  TestListView,
  TestFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'testList',

    breadcrumbs: [
      t.bound('tests', 'BREADCRUMBS:browse')
    ],

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.tests-list-container', this.listView);
    },

    defineModels: function()
    {
      this.testList = bindLoadingMessage(
        new TestCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new TestListView({collection: this.testList});

      this.filterView = new TestFilterView({
        model: {
          rqlQuery: this.testList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.testList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.testList.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.testList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
