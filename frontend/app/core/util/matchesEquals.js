// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore'
], function(
  _
) {
  'use strict';

  return function matchesEquals(rqlQuery, name, value)
  {
    var term = _.find(rqlQuery.selector.args, function(term)
    {
      return term.name === 'eq' && term.args[0] === name;
    });

    return !term || term.args[1] === value;
  };
});
