// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'jquery',
  '../broker',
  '../socket',
  '../controller',
  '../core/Model',
  '../data/programs',
  '../tests/Test'
], function(
  _,
  $,
  broker,
  socket,
  controller,
  Model,
  programs,
  Test
) {
  'use strict';

  return Model.extend({

    defaults: {
      status: 'offline',
      currentTest: null,
      lastTest: null,
      currentProgram: null
    },

    initialize: function()
    {
      this.broker = broker.sandbox();

      this.update();

      this.broker.subscribe('controller.tagValuesChanged', this.onTagValuesChanged.bind(this));
    },

    destroy: function()
    {
      this.broker.destroy();
    },

    fetch: function()
    {
      var deferred = $.Deferred();
      var model = this;

      socket.emit('tests.getData', function(testData)
      {
        var currentTest = testData.currentTest ? new Test(testData.currentTest) : null;
        var lastTest = testData.currentTest ? new Test(testData.currentTest) : null;

        model.set({
          currentTest: currentTest,
          lastTest: lastTest
        });

        model.update();

        deferred.resolve();
      });

      return deferred.promise();
    },

    isTesting: function()
    {
      return this.get('currentTest') !== null;
    },

    getCurrentProgram: function()
    {
      if (this.isTesting())
      {
        return this.get('currentTest').get('program');
      }

      var testKind1 = controller.getValue('testKind.1');
      var testKind2 = controller.getValue('testKind.2');
      var program;

      if (testKind1 === true && testKind2 === false)
      {
        program = programs.get(controller.getValue('program.30s'));
      }
      else if (testKind1 === false && testKind2 === false)
      {
        program = programs.get(controller.getValue('program.hrs'));
      }
      else
      {
        program = programs.get(controller.getValue('program.tester'));
      }

      return program || null;
    },

    onTagValuesChanged: function(changes)
    {
      _.each(changes, this.updateState, this);
    },

    updateState: function(newValue, tagName)
    {
      switch (tagName)
      {
        case 'masters.controlProcess':
          this.updateStatus();
          break;

        case 'program.30s':
        case 'program.hrs':
        case 'program.tester':
        case 'testKind.1':
        case 'testKind.2':
          this.updateCurrentProgram();
          break;
      }
    },

    update: function()
    {
      this.updateStatus();
      this.updateCurrentProgram();
    },

    updateStatus: function()
    {
      var status = 'offline';

      if (controller.getValue('masters.controlProcess'))
      {
        status = this.isTesting() ? 'testing' : 'online';
      }

      this.set('status', status);
    },

    updateCurrentProgram: function()
    {
      var oldCurrentProgram = this.get('currentProgram') || null;
      var newCurrentProgram = this.getCurrentProgram() || null;

      if (!newCurrentProgram
        || !oldCurrentProgram
        || oldCurrentProgram.id !== newCurrentProgram.id)
      {
        this.set('currentProgram', newCurrentProgram);
      }
    }

  });
});
