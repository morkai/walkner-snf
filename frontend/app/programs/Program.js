// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

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
      lampCount: 1,
      lightSensors: true,
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
      k15: false,
      k16: false,
      k17: false,
      k18: false,
      k19: false,
      k20: false,
      k21: false,
      minCurrent: 0,
      maxCurrent: 0
    },

    getTotalDuration: function()
    {
      return this.get('illuminationTime')
        + (this.get('hrsInterval') + this.get('hrsTime')) * this.get('hrsInterval');
    }

  }, {
    CONTACTORS: [
      'testerK12',
      'ballast400W1',
      'ballast400W2',
      'ballast2000W',
      'ignitron400W1',
      'ignitron400W2',
      'ignitron2000W',
      'k15',
      'k16',
      'k17',
      'k18',
      'k19',
      'k20',
      'k21'
    ]
  });
});
