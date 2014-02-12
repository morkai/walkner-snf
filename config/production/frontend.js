'use strict';

var config = module.exports = require('../frontend');

config.modules.push('exec');

config.httpServer.port = 80;

config.httpsServer.port = 443;

config.user.localAddresses = ['127.0.0'];

config.exec = {
  cmd: 'export DISPLAY=:0'
    + ' ; killall google-chrome'
    + ' ; /usr/bin/google-chrome --user-data-dir=/root/chrome-profile --kiosk',
  afterAppStarted: true
};
