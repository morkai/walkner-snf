define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/util/bindLoadingMessage',
  'app/core/util/pageActions',
  'app/core/View',
  'app/core/views/ListView',
  '../ProgramCollection',
  '../views/ProgramFilterView',
  'app/programs/templates/listPage',
  'i18n!app/nls/programs'
], function(
  $,
  t,
  viewport,
  bindLoadingMessage,
  pageActions,
  View,
  ListView,
  ProgramCollection,
  ProgramFilterView,
  listPageTemplate
) {
  'use strict';

  return View.extend({

    template: listPageTemplate,

    layoutName: 'page',

    pageId: 'programList',

    breadcrumbs: [
      t.bound('programs', 'BREADCRUMBS:browse')
    ],

    actions: function()
    {
      return [pageActions.add(this.programList)];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();

      this.setView('.filter-container', this.filterView);
      this.setView('.programs-list-container', this.listView);
    },

    defineModels: function()
    {
      this.programList = bindLoadingMessage(
        new ProgramCollection(null, {rqlQuery: this.options.rql}), this
      );
    },

    defineViews: function()
    {
      this.listView = new ListView({
        columns: Object.keys(this.programList.rqlQuery.fields),
        collection: this.programList,
        serializeRow: function(model)
        {
          var row = model.toJSON();

          row.kind = t('programs', 'kind:' + row.kind);

          return row;
        }
      });

      this.filterView = new ProgramFilterView({
        model: {
          rqlQuery: this.programList.rqlQuery
        }
      });

      this.listenTo(this.filterView, 'filterChanged', this.refreshList);
    },

    load: function(when)
    {
      return when(this.programList.fetch({reset: true}));
    },

    refreshList: function(newRqlQuery)
    {
      this.programList.rqlQuery = newRqlQuery;

      this.listView.refreshCollection(null, true);

      this.broker.publish('router.navigate', {
        url: this.programList.genClientUrl() + '?' + newRqlQuery,
        trigger: false,
        replace: true
      });
    }

  });
});
