define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  'app/core/views/ListView',
  '../UserCollection',
  '../views/UserFilterView',
  'app/users/templates/listPage',
  'i18n!app/nls/users'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  UserCollection,
  UserFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'userList',

    breadcrumbs: [
      t.bound('users', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      return [pageActions.add(this.userList)];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.users-list-container', this.listView);
    },

    defineModels: function()
    {
      this.userList = bindLoadingMessage(
        new UserCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ListView({
        columns: ['login', 'lastName', 'firstName'],
        collection: this.userList
      });

      this.filterView = new UserFilterView({
        model: {
          rqlQuery: this.userList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.userList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.userList.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.userList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
