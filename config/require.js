'use strict';

exports.paths = {
  'text': 'vendor/require/text',
  'i18n': 'vendor/require/i18n',
  'domReady': 'vendor/require/domReady',
  'underscore': 'vendor/underscore',
  'jquery': 'vendor/jquery',
  'jquery.transit': 'vendor/jquery.transit',
  'jquery.kinetic': 'vendor/jquery.kinetic',
  'backbone': 'vendor/backbone',
  'backbone.layout': 'vendor/backbone.layoutmanager',
  'moment': 'vendor/moment/moment',
  'moment-lang': 'vendor/moment/lang',
  'moment-timezone': 'vendor/moment/moment-timezone',
  'bootstrap': 'vendor/bootstrap/js/bootstrap',
  'bootstrap-colorpicker': 'vendor/bootstrap-colorpicker/js/bootstrap-colorpicker',
  'socket.io': 'vendor/socket.io',
  'h5.pubsub': 'vendor/h5.pubsub',
  'h5.rql': 'vendor/h5.rql',
  'form2js': 'vendor/form2js',
  'js2form': 'vendor/js2form',
  'reltime': 'vendor/reltime',
  'select2': 'vendor/select2/select2',
  'select2-lang': 'vendor/select2-lang',
  'highcharts': 'vendor/highcharts-custom',
  'zeroclipboard': 'vendor/zeroclipboard/ZeroClipboard'
};

exports.shim = {
  'jquery.transit': ['jquery'],
  'jquery.kinetic': ['jquery'],
  'underscore': {
    exports: '_'
  },
  'backbone': {
    deps: ['underscore', 'jquery'],
    exports: 'Backbone'
  },
  'bootstrap': ['jquery'],
  'bootstrap-colorpicker': ['bootstrap'],
  'reltime': {
    exports: 'reltime'
  },
  'select2': {
    deps: ['jquery'],
    exports: 'Select2'
  },
  'highcharts': {
    deps: ['jquery'],
    exports: 'Highcharts'
  }
};

exports.buildPaths = exports.paths;
exports.buildShim = exports.shim;
