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
    lightSensors: {
      type: Number,
      min: 1,
      max: 2,
      default: 1
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
    }
  }, {
    id: false
  });

  programSchema.statics.TOPIC_PREFIX = 'programs';

  programSchema.methods.getContactors = function()
  {
    return {
      testerK12: this.testerK12,
      ballast400W1: this.ballast400W1,
      ballast400W2: this.ballast400W2,
      ballast2000W: this.ballast2000W,
      ignitron400W1: this.ignitron400W1,
      ignitron400W2: this.ignitron400W2,
      ignitron2000W: this.ignitron2000W
    };
  };

  mongoose.model('Program', programSchema);
};
