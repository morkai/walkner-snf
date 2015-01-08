// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/tags',

    clientUrlRoot: '#diagnostics/tags',

    topicPrefix: 'tags',

    privilegePrefix: 'DIAGNOSTICS',

    nlsDomain: 'diagnostics',

    idAttribute: 'name',

    labelAttribute: 'name',

    defaults: {
      description: '',
      master: null,
      unit: -1,
      kind: 'virtual',
      type: 'uint16',
      address: null,
      readable: false,
      writable: false,
      rawMin: null,
      rawMax: null,
      scaleUnit: null,
      scaleFunction: null,
      scaleMin: null,
      scaleMax: null,
      archive: null
    }

  });
});
