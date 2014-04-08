// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

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
