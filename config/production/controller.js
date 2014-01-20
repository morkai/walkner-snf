'use strict';

var config = module.exports = require('../controller');

config.modbus.writeAllTheThings = null;

config.modbus.controlMasters = ['snfPlc'];

config.modbus.masters = {
  snfPlc: {
    defaultTimeout: 100,
    interval: 100,
    suppressTransactionErrors: true,
    transport: {
      type: 'ip',
      connection: {
        type: 'tcp',
        host: '192.168.1.5',
        port: 502,
        noActivityTime: 2000
      }
    }
  }
};
