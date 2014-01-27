'use strict';

var util = require('util');
var step = require('h5.step');
var ControlUnit = require('./ControlUnit');

module.exports = Watchdog;

function Watchdog(app)
{
  ControlUnit.call(this, app.broker, app.modbus, app.program, 'watchdog');

  this.first = true;
  this.timer = null;

  this.watch(['contactors.2'], 'manageWatchdog');
}

util.inherits(Watchdog, ControlUnit);

Watchdog.prototype.manageWatchdog = function()
{
  var lock = this.lock('manageTest');

  if (lock.isLocked())
  {
    lock.cb = this.manageWatchdog.bind(this);

    return;
  }

  lock.on();

  var first = this.first;
  var testing = this.getTagValue('contactors.2') === true;

  this.first = false;

  if (first && testing)
  {
    return lock.off();
  }

  if (this.timer === null)
  {
    this.timer = setInterval(this.refresh.bind(this), 1000);
  }
};

Watchdog.prototype.refresh = function()
{
  if (this.getTagValue('masters.controlProcess'))
  {
    this.setTagValue('watchdog', true);
  }
};
