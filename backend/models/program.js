// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

module.exports = function setupProgramModel(app, mongoose)
{
  var programSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    kind: {
      type: String,
      enum: ['30s', 'hrs', 'tester'],
      default: '30s'
    },
    lightSourceType: {
      type: String,
      enum: ['100', '2x100', '400', '2x400', '2000'],
      default: '100'
    },
    bulbPower: {
      type: String,
      enum: ['100', '2x100', '150', '250', '2x250', '400', '2x400', '600', '2x600', '1000', '2000'],
      default: '100'
    },
    ballast: {
      type: String,
      enum: ['400', '2x400', '2000'],
      default: '400'
    },
    ignitron: {
      type: String,
      enum: ['outside', 'fitting', 'tin'],
      default: 'outside'
    },
    lampCount: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
    },
    lampBulb: {
      type: Boolean,
      default: false
    },
    lightSensors: {
      type: Boolean,
      default: true
    },
    plcProgram: {
      type: Number,
      min: 0,
      default: 0
    },
    waitForStartTime: {
      type: Number,
      default: 0
    },
    illuminationTime: {
      type: Number,
      default: 0
    },
    hrsInterval: {
      type: Number,
      default: 0
    },
    hrsTime: {
      type: Number,
      default: 0
    },
    hrsCount: {
      type: Number,
      default: 0
    },
    interlock: {
      type: String,
      enum: ['1', '1+2', 'mnh'],
      default: '1'
    },
    testerK12: {
      type: Boolean,
      default: false
    },
    ballast400W1: {
      type: Boolean,
      default: false
    },
    ballast400W2: {
      type: Boolean,
      default: false
    },
    ballast2000W: {
      type: Boolean,
      default: false
    },
    ignitron400W1: {
      type: Boolean,
      default: false
    },
    ignitron400W2: {
      type: Boolean,
      default: false
    },
    ignitron2000W: {
      type: Boolean,
      default: false
    },
    limitSwitch: {
      type: Boolean,
      default: false
    },
    minCurrent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    maxCurrent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }, {
    id: false
  });

  programSchema.statics.TOPIC_PREFIX = 'programs';

  programSchema.methods.getContactorsByte = function()
  {
    var contactorsByte = this.ballast400W1 ? 1 : 0;

    if (this.ballast400W2)
    {
      contactorsByte |= 2;
    }

    if (this.ballast2000W)
    {
      contactorsByte |= 4;
    }

    if (this.ignitron400W1)
    {
      contactorsByte |= 8;
    }

    if (this.ignitron400W2)
    {
      contactorsByte |= 16;
    }

    if (this.ignitron2000W)
    {
      contactorsByte |= 32;
    }

    if (this.kind === 'hrs')
    {
      contactorsByte |= 64;
    }

    if (this.limitSwitch)
    {
      contactorsByte |= 128;
    }

    return contactorsByte;
  };

  mongoose.model('Program', programSchema);
};
