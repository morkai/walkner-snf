// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/programs/ProgramCollection',
  './createStorage'
], function(
  ProgramCollection,
  createStorage
) {
  'use strict';

  return createStorage('PROGRAMS', 'programs', ProgramCollection);
});
