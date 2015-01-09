// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

module.exports = function setupProgramModel(app, mongoose)
{
  var KINDS = ['30s', 'hrs', 'tester'];
  var LIGHT_SOURCE_TYPES = ['100', '2x100', '400', '2x400', '2000'];
  var BULB_POWERS = ['100', '2x100', '150', '250', '2x250', '400', '2x400', '600', '2x600', '1000', '2000'];
  var BALLASTS = ['400', '2x400', '2000'];
  var IGNITRONS = ['outside', 'fitting', 'tin'];
  var INTERLOCKS = ['1', '1+2', 'mnh'];

  var PROGRAM_OPTIONS = JSON.stringify({
    kinds: KINDS,
    lightSourceTypes: LIGHT_SOURCE_TYPES,
    bulbPowers: BULB_POWERS,
    ballasts: BALLASTS,
    ignitrons: IGNITRONS,
    interlocks: INTERLOCKS
  });

  var IO = {
    type: Boolean,
    default: false
  };

  var imageSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['jpg', 'png', 'gif']
    },
    label: {
      type: String,
      required: true
    }
  }, {
    id: false
  });

  var programSchema = mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    kind: {
      type: String,
      enum: KINDS,
      default: '30s'
    },
    lightSourceType: {
      type: String,
      enum: LIGHT_SOURCE_TYPES,
      default: '100'
    },
    bulbPower: {
      type: String,
      enum: BULB_POWERS,
      default: '100'
    },
    ballast: {
      type: String,
      enum: BALLASTS,
      default: '400'
    },
    ignitron: {
      type: String,
      enum: IGNITRONS,
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
      enum: INTERLOCKS,
      default: '1'
    },
    testerK12: IO,
    ballast400W1: IO,
    ballast400W2: IO,
    ballast2000W: IO,
    ignitron400W1: IO,
    ignitron400W2: IO,
    ignitron2000W: IO,
    limitSwitch: IO,
    k15: IO,
    k16: IO,
    k17: IO,
    k18: IO,
    k19: IO,
    k20: IO,
    k21: IO,
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
    },
    images: [imageSchema]
  }, {
    id: false
  });

  programSchema.statics.TOPIC_PREFIX = 'programs';

  programSchema.methods.getContactorsBytes = function()
  {
    var contactorsBytes = this.ballast400W1 ? 1 : 0;

    if (this.ballast400W2)
    {
      contactorsBytes |= 2;
    }

    if (this.ballast2000W)
    {
      contactorsBytes |= 4;
    }

    if (this.ignitron400W1)
    {
      contactorsBytes |= 8;
    }

    if (this.ignitron400W2)
    {
      contactorsBytes |= 16;
    }

    if (this.ignitron2000W)
    {
      contactorsBytes |= 32;
    }

    if (this.k15)
    {
      contactorsBytes |= 64;
    }

    if (this.k16)
    {
      contactorsBytes |= 128;
    }

    if (this.k17)
    {
      contactorsBytes |= 256;
    }

    if (this.k18)
    {
      contactorsBytes |= 512;
    }

    if (this.k19)
    {
      contactorsBytes |= 1024;
    }

    if (this.k20)
    {
      contactorsBytes |= 2048;
    }

    if (this.k21)
    {
      contactorsBytes |= 4096;
    }

    if (this.testerK12)
    {
      contactorsBytes |= 8192;
    }

    return contactorsBytes;
  };

  mongoose.model('Program', programSchema);

  app.broker.subscribe('app.prepareFrontendData', function(appData)
  {
    appData.PROGRAM_OPTIONS = PROGRAM_OPTIONS;
  });
};
