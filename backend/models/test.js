// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

module.exports = function setupTestModel(app, mongoose)
{
  var testSchema = mongoose.Schema({
    startedAt: Date,
    finishedAt: Date,
    program: {},
    result: Boolean,
    currentPassed: Boolean,
    lightPassed: Boolean,
    timePassed: Boolean,
    tags: {},
    extremes: {}
  }, {
    id: false
  });

  testSchema.statics.TOPIC_PREFIX = 'tests';

  mongoose.model('Test', testSchema);
};
