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
