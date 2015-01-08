// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([

], function(

) {
  'use strict';

  var STORAGE_KEY = 'PRIVILEGES';
  var privileges = window[STORAGE_KEY] || [];

  delete window[STORAGE_KEY];

  return privileges;
});
