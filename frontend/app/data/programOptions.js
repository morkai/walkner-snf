define([

], function(

) {
  'use strict';

  var STORAGE_KEY = 'PROGRAM_OPTIONS';
  var programOptions = window[STORAGE_KEY] || {
    kinds: [],
    lightSourceTypes: [],
    bulbPowers: [],
    ballasts: [],
    ignitrons: [],
    interlocks: []
  };

  delete window[STORAGE_KEY];

  return programOptions;
});
