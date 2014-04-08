// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  '../i18n',
  '../core/Collection',
  './EventType'
], function(
  t,
  Collection,
  EventType
) {
  'use strict';

  return Collection.extend({

    model: EventType,

    parse: function(response)
    {
      return response.map(function(type)
      {
        return {value: type, label: t.bound('events', 'TYPE:' + type)};
      });
    }

  });
});
