// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './User'
], function(
  Collection,
  User
) {
  'use strict';

  return Collection.extend({

    model: User,

    rqlQuery:
      'select(lastName,firstName,login,email)'
        + '&sort(+lastName,+firstName)&limit(15)'

  });
});
