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

    rqlQuery: 'select(login,lastName,firstName)&sort(+lastName,+firstName)&limit(15)'

  });
});
