define([
  '../core/Collection',
  './Program'
], function(
  Collection,
  Program
) {
  'use strict';

  return Collection.extend({

    model: Program,

    rqlQuery: 'select(name,kind)&sort(name)&limit(15)'

  });
});
