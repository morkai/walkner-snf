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
