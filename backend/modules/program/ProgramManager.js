// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var util = require('util');
var step = require('h5.step');
var ControlUnit = require('./ControlUnit');

module.exports = ProgramManager;

function ProgramManager(app)
{
  ControlUnit.call(this, app.broker, app.modbus, app.program, 'program');

  this.Program = app.mongoose.model('Program');

  this.currentProgram = null;

  this.broker.subscribe('programs.edited', this.onProgramEdited.bind(this));

  this.watch(
    [
      '.30s', '.hrs', '.tester',
      'testKind.*',
      '.mnh',
      '.lampCount',
      '.lampBulb',
      '.lightSensors',
      '.limitSwitch',
      '.hrsCount.pc',
      '.hrsInterval.pc',
      '.hrsDuration',
      '.timeToShine',
      '.duration.pc',
      '.current.min',
      '.current.max',
      '.contactors',
      'light.1.min.plc',
      'light.2.min.plc',
      'light.1.min.pc',
      'light.2.min.pc'
    ],
    'manageProgram'
  );
}

util.inherits(ProgramManager, ControlUnit);

ProgramManager.prototype.getCurrentProgram = function()
{
  return this.currentProgram;
};

ProgramManager.prototype.is30sKind = function()
{
  return this.getTagValue('testKind.1') && !this.getTagValue('testKind.2');
};

ProgramManager.prototype.isHrsKind = function()
{
  return !this.getTagValue('testKind.1') && !this.getTagValue('testKind.2');
};

ProgramManager.prototype.onProgramEdited = function(message)
{
  var program = message.model;

  if (!this.getTagValue('contactors.2')
    && program._id === this.getTagValue('program.' + program.kind))
  {
    this.changeProgram(program.kind);
  }
};

ProgramManager.prototype.manageProgram = function()
{
  if (this.is30sKind())
  {
    this.changeProgram('30s');
  }
  else if (this.isHrsKind())
  {
    this.changeProgram('hrs');
  }
  else
  {
    this.changeProgram('tester');
  }
};

ProgramManager.prototype.changeProgram = function(which)
{
  var lock = this.lock('changeProgram');

  if (lock.isLocked())
  {
    lock.cb = this.manageProgram.bind(this);

    return;
  }

  lock.on();

  var controlUnit = this;

  this.Program.findById(this.getTagValue('.' + which), function(err, program)
  {
    if (err)
    {
      controlUnit.error("Failed to find a program: %s", err.stack);
    }

    controlUnit.updateProgramTags(program, lock);
  });
};

ProgramManager.prototype.updateProgramTags = function(program, lock)
{
  var controlUnit = this;
  var noProgram = !program;
  var contactorsByte = noProgram ? 0 : program.getContactorsByte();

  this.currentProgram = program || null;

  if (!program)
  {
    program = {};
  }

  step(
    function setTagsStep()
    {
      controlUnit.setTagValue('.mnh', program.lampCount === 3, this.parallel());
      controlUnit.setTagValue('.lampCount', program.lampCount === 2, this.parallel());
      controlUnit.setTagValue('.lampBulb', program.lampBulb, this.parallel());
      controlUnit.setTagValue('.lightSensors', !!program.lightSensors, this.parallel());
      controlUnit.setTagValue('.limitSwitch', program.limitSwitch === true, this.parallel());
      controlUnit.setTagValue('.hrsCount.pc', program.hrsCount || 0, this.parallel());
      controlUnit.setTagValue('.hrsInterval.pc', program.hrsInterval || 0, this.parallel());
      controlUnit.setTagValue('.hrsDuration', program.hrsTime || 0, this.parallel());
      controlUnit.setTagValue('.timeToShine', program.waitForStartTime || 0, this.parallel());
      controlUnit.setTagValue('.duration.pc', program.illuminationTime || 0, this.parallel());
      controlUnit.setTagValue('.current.min', program.minCurrent || 0, this.parallel());
      controlUnit.setTagValue('.current.max', program.maxCurrent || 0, this.parallel());
      controlUnit.setTagValue('.contactors', contactorsByte, this.parallel());
      controlUnit.setTagValue(
        'light.1.min.plc', controlUnit.getTagValue('light.1.min.pc') || 0, this.parallel()
      );
      controlUnit.setTagValue(
        'light.2.min.plc', controlUnit.getTagValue('light.2.min.pc') || 0, this.parallel()
      );
    },
    function publishAndUnlockStep()
    {
      controlUnit.broker.publish('programs.changed', noProgram ? null : program.toJSON());

      lock.off();
    }
  );
};
