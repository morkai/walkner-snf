// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/FilteredListPage',
  '../views/TestFilterView',
  '../views/TestListView'
], function(
  FilteredListPage,
  TestFilterView,
  TestListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: TestFilterView,
    ListView: TestListView,

    actions: []

  });
});
