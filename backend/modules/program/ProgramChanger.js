'use strict';

var util = require('util');
var step = require('h5.step');
var ControlUnit = require('./ControlUnit');

module.exports = ProgramChanger;

var CLOSED_CONTACTORS = {
  testerK12: false,
  ballast400W1: false,
  ballast400W2: false,
  ballast2000W: false,
  ignitron400W1: false,
  ignitron400W2: false,
  ignitron2000W: false
};

function ProgramChanger(app)
{
  ControlUnit.call(this, app.broker, app.modbus, app.program, 'programChanger');

  this.Program = app.mongoose.model('Program');

  this.watch(['programs.pc.*', 'testKind.*'], 'manageProgram');
}

util.inherits(ProgramChanger, ControlUnit);

ProgramChanger.prototype.is30sKind = function()
{
  return this.getTagValue('testKind.1') && !this.getTagValue('testKind.2');
};

ProgramChanger.prototype.isHrsKind = function()
{
  return !this.getTagValue('testKind.1') && !this.getTagValue('testKind.2');
};

ProgramChanger.prototype.manageProgram = function()
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
    this.changeProgram(null);
  }
};

ProgramChanger.prototype.changeProgram = function(which)
{
  var lock = this.lock('changeProgram');

  if (lock.isLocked())
  {
    lock.cb = this.manageProgram.bind(this);

    return;
  }

  lock.on();

  if (!which)
  {
    return this.setContactors(CLOSED_CONTACTORS, lock);
  }

  var me = this;

  this.Program.findById(this.getTagValue('programs.pc.' + which), function(err, program)
  {
    me.setContactors(program ? program.getContactors() : CLOSED_CONTACTORS, lock);
  });
};

ProgramChanger.prototype.setContactors = function(contactors, lock)
{
  var steps = [];
  var me = this;

  Object.keys(contactors).forEach(function(key)
  {
    var value = contactors[key];

    steps.push(function setContactorStep()
    {
      var next = this.next();

      me.setTagValue('contactors.' + key, value, function(err, unchanged)
      {
        if (err)
        {
          me.warn(
            "Failed to set the [%s] contactor to [%s]: %s", key, value, err.stack
          );
        }
        else if (!unchanged)
        {
          me.debug("Set the [%s] contactor to [%s].", key, value);
        }

        next();
      });
    });
  });

  steps.push(function unlockStep()
  {
    lock.off();
  });

  step(steps);
};
