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
