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
      kind: '30s',
      lightSourceType: '100',
      bulbPower: '100',
      ballast: '400',
      ignitron: 'outside',
      lightSensors: 1,
      plcProgram: 0,
      waitForStartTime: 10,
      illuminationTime: 30,
      hrsInterval: 0,
      hrsTime: 0,
      hrsCount: 0,
      interlock: '1',
      testerK12: false,
      ballast400W1: false,
      ballast400W2: false,
      ballast2000W: false,
      ignitron400W1: false,
      ignitron400W2: false,
      ignitron2000W: false,
      limitSwitch: false,
      minCurrent: 0,
      maxCurrent: 0
    }

  }, {
    CONTACTORS: [
      'testerK12',
      'ballast400W1',
      'ballast400W2',
      'ballast2000W',
      'ignitron400W1',
      'ignitron400W2',
      'ignitron2000W'
    ]
  });
});
