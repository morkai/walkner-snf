// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  '../core/Model',
  '../programs/Program'
], function(
  Model,
  Program
) {
  'use strict';

  return Model.extend({

    urlRoot: '/tests',

    clientUrlRoot: '#tests',

    topicPrefix: 'tests',

    privilegePrefix: 'TESTS',

    nlsDomain: 'tests',

    defaults: {
      startedAt: null,
      finishedAt: null,
      program: null,
      result: null,
      currentPassed: null,
      lightPassed: null,
      timePassed: null,
      tags: null
    },

    initialize: function()
    {
      var program = this.get('program');

      if (program && !(program instanceof Program))
      {
        this.set('program', new Program(program));
      }
    }

  });
});
