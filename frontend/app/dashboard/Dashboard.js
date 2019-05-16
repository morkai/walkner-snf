// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../broker',
  '../socket',
  '../controller',
  '../core/Model',
  '../snf-programs/Program',
  '../snf-tests/Test'
], function(
  _,
  $,
  broker,
  socket,
  controller,
  Model,
  Program,
  Test
) {
  'use strict';

  return Model.extend({

    nlsDomain: 'dashboard',

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

      this.broker.subscribe('controller.valuesChanged', this.onTagValuesChanged.bind(this));
    },

    destroy: function()
    {
      this.broker.destroy();
    },

    fetch: function()
    {
      var deferred = $.Deferred();
      var model = this;

      socket.emit('snf.tests.getData', function(testData)
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

      var testKind1 = controller.tags.getValue('testKind.1');
      var testKind2 = controller.tags.getValue('testKind.2');
      var program;

      if (testKind1 === true && testKind2 === false)
      {
        program = controller.tags.getValue('program.30s');
      }
      else if (testKind1 === false && testKind2 === false)
      {
        program = controller.tags.getValue('program.hrs');
      }
      else
      {
        program = controller.tags.getValue('program.tester');
      }

      return program ? new Program(program) : null;
    },

    onTagValuesChanged: function(changes)
    {
      _.forEach(changes, this.updateState, this);
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

      if (controller.tags.getValue('masters.controlProcess'))
      {
        status = this.isTesting() ? 'testing' : 'online';
      }

      this.set('status', status);
    },

    updateCurrentProgram: function()
    {
      var oldProgram = this.get('currentProgram') || null;
      var newProgram = this.getCurrentProgram() || null;

      if (!newProgram || !oldProgram || !_.isEqual(oldProgram.attributes, newProgram.attributes))
      {
        this.set('currentProgram', newProgram);
      }
    }

  });
});
