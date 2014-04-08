// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var util = require('util');
var step = require('h5.step');
var ControlUnit = require('./ControlUnit');

module.exports = TestManager;

function TestManager(app)
{
  ControlUnit.call(this, app.broker, app.modbus, app.program, 'test');

  this.Test = app.mongoose.model('Test');
  this.Program = app.mongoose.model('Program');

  this.currentTest = null;
  this.lastTest = null;
  this.tags = null;
  this.tagCollectionTimer = null;

  this.watch(['contactors.2', '.success', '.failure'], 'manageTest');
  this.watch(['.failure.current', '.failure.light', '.failure.time'], 'handleFailure');
}

util.inherits(TestManager, ControlUnit);

TestManager.prototype.manageTest = function()
{
  var lock = this.lock('manageTest');

  if (lock.isLocked())
  {
    lock.cb = this.manageTest.bind(this);

    return;
  }

  lock.on();

  if (this.getTagValue('contactors.2'))
  {
    return this.beginTest(lock);
  }

  return setTimeout(this.finishTest.bind(this, new Date(), lock), 1000);
};

TestManager.prototype.beginTest = function(lock)
{
  if (this.currentTest)
  {
    this.warn("Trying to begin a test, but a test is already running?");

    return lock.off();
  }

  var currentProgram = this.program.programManager.getCurrentProgram();

  if (!currentProgram)
  {
    this.warn("Trying to begin a test, but there is no program selected :(");

    return lock.off();
  }

  this.currentTest = new this.Test({
    startedAt: new Date(),
    program: currentProgram,
    result: false,
    currentPassed: true,
    lightPassed: true,
    timePassed: true,
    extremes: {
      minLight1: this.getTagValue('light.1.min.pc'),
      minLight2: this.getTagValue('light.2.min.pc'),
      minCurrent: this.getTagValue('program.current.min'),
      maxCurrent: this.getTagValue('program.current.max')
    }
  });

  this.startCollectingTags();

  this.broker.publish('tests.started', this.currentTest.toJSON());

  this.debug("Test started [%s]...", currentProgram.get('name'));

  return lock.off();
};

TestManager.prototype.handleFailure = function()
{
  if (!this.currentTest)
  {
    return;
  }

  if (this.getTagValue('.failure.current'))
  {
    this.currentTest.currentPassed = false;
  }

  if (this.getTagValue('.failure.light'))
  {
    this.currentTest.lightPassed = false;
  }

  if (this.getTagValue('.failure.time'))
  {
    this.currentTest.timePassed = false;
  }
};

TestManager.prototype.finishTest = function(finishedAt, lock)
{
  if (!this.currentTest)
  {
    this.warn("Trying to finish a test, but no test was running?");

    return lock.off();
  }

  this.stopCollectingTags();

  var currentTest = this.currentTest;

  currentTest.set({
    finishedAt: finishedAt,
    result: currentTest.currentPassed && currentTest.lightPassed && currentTest.timePassed,
    tags: this.tags
  });

  this.currentTest = null;
  this.tags = null;

  var controlUnit = this;

  currentTest.save(function(err)
  {
    controlUnit.lastTest = null;

    if (err)
    {
      controlUnit.error("Failed to save the current test: %s", err.stack);

      controlUnit.broker.publish('tests.finished');
    }
    else
    {
      controlUnit.debug(
        "Test completed %s", currentTest.result ? "successfully :)" : "with an error :("
      );

      controlUnit.lastTest = currentTest.get('_id').toString();
    }

    controlUnit.broker.publish('tests.finished', controlUnit.lastTest);

    return lock.off();
  });
};

TestManager.prototype.startCollectingTags = function()
{
  this.tags = {
    temperature: [],
    light1: [],
    light2: [],
    current: [],
    voltage: []
  };

  this.tagCollectionTimer = setInterval(this.collectTags.bind(this), 1000);

  this.collectTags();
};

TestManager.prototype.collectTags = function()
{
  this.tags.temperature.push(this.getTagValue('temperature'));
  this.tags.light1.push(this.getTagValue('light.1'));
  this.tags.light2.push(this.getTagValue('light.2'));
  this.tags.current.push(this.getTagValue('current'));
  this.tags.voltage.push(this.getTagValue('voltage'));
};

TestManager.prototype.stopCollectingTags = function()
{
  clearInterval(this.tagCollectionTimer);
  this.tagCollectionTimer = null;
};
