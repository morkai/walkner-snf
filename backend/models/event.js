// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

module.exports = function setupEventModel(app, mongoose)
{
  var eventSchema = mongoose.Schema({
    type: {
      type: String,
      trim: true,
      required: true
    },
    severity: {
      type: String,
      enum: ['debug', 'info', 'success', 'warning', 'error'],
      default: 'info'
    },
    time: {
      type: Number,
      default: Date.now
    },
    user: {
      type: Object
    },
    data: {
      type: Object
    }
  }, {
    id: false
  });

  eventSchema.statics.TOPIC_PREFIX = 'events';

  eventSchema.index({time: -1, severity: 1});
  eventSchema.index({time: -1, type: 1});

  mongoose.model('Event', eventSchema);
};
