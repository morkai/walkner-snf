// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

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
        .subtract(7, 'days')
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
