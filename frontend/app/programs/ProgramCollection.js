// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

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
