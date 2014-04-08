// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/views/ListView'
], function(
  _,
  t,
  time,
  ListView
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'tests.finished': 'refreshCollection'
    },

    columns: ['program', 'startedAt', 'finishedAt', 'duration'],

    serializeRows: function()
    {
      return this.collection.map(function(test)
      {
        var row = test.toJSON();

        row.className = row.result ? 'success' : 'danger';

        row.duration =
          time.toString((Date.parse(row.finishedAt) - Date.parse(row.startedAt)) / 1000);

        row.startedAt = time.format(row.startedAt, 'YYYY-MM-DD HH:mm:ss');
        row.finishedAt = time.format(row.finishedAt, 'YYYY-MM-DD HH:mm:ss');

        row.program = row.program.getLabel();

        return row;
      });
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        return [ListView.actions.viewDetails(collection.get(row._id))];
      };
    }

  });
});
