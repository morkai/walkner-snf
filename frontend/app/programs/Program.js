define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/programs',

    clientUrlRoot: '#programs',

    topicPrefix: 'programs',

    privilegePrefix: 'PROGRAMS',

    nlsDomain: 'programs',

    labelAttribute: 'name',

    defaults: {
      name: '',
      lightSensors: 1,
      waitForStartTime: '10s',
      illuminationTime: '30s',
      interlock: '1'
    }

  });
});
