define([
  'moment',
  '../core/Collection',
  './Test'
], function(
  moment,
  Collection,
  Test
) {
  'use strict';

  return Collection.extend({

    model: Test,

    rqlQuery: function(rql)
    {
      var sevenDaysAgo = moment()
        .hours(0)
        .minutes(0)
        .seconds(0)
        .milliseconds(0)
        .subtract('days', 7)
        .valueOf();

      return rql.Query.fromObject({
        fields: {startedAt: 1, finishedAt: 1, 'program.name': 1, result: 1},
        sort: {finishedAt: -1},
        limit: 15,
        selector: {
          name: 'and',
          args: [
            {name: 'ge', args: ['startedAt', sevenDaysAgo]}
          ]
        }
      });
    }

  });
});
