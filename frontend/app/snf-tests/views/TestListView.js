// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

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

    className: 'is-clickable is-colored',

    remoteTopics: {
      'snf.tests.finished': 'refreshCollection',
      'snf.tests.saved': function(data)
      {
        var test = this.collection.get(data._id);

        if (test)
        {
          test.set(data);
          this.render();
        }
      }
    },

    columns: [
      {id: 'orderNo', className: 'is-min'},
      {id: 'serialNo', className: 'is-min is-number'},
      {id: 'program', className: 'is-min'},
      {id: 'startedAt', className: 'is-min'},
      {id: 'finishedAt', className: 'is-min'},
      {id: 'duration'}
    ],

    serializeActions: function()
    {

    }

  });
});
