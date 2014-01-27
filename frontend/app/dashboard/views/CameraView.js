define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/i18n',
  'app/user',
  'app/controller',
  'app/data/programs',
  'app/core/View',
  'app/dashboard/templates/camera'
], function(
  _,
  $,
  viewport,
  t,
  user,
  controller,
  programs,
  View,
  cameraTemplate
) {
  'use strict';

  navigator.getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia
    || navigator.msGetUserMedia;

  var stream;

  return View.extend({

    template: cameraTemplate,

    initialize: function()
    {
      this.idPrefix = _.uniqueId('camera');
    },

    destroy: function()
    {
      this.context = null;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      this.setUpCamera();
    },

    setUpCamera: function()
    {
      if (!navigator.getUserMedia)
      {
        return;
      }

      if (typeof stream === 'undefined')
      {
        navigator.getUserMedia(
          {video: true, audio: false},
          this.onCameraSuccess.bind(this),
          this.onCameraError.bind(this)
        );
      }
      else if (stream !== null)
      {
        this.setUpVideo();
      }
    },

    onCameraSuccess: function(localMediaStream)
    {
      stream = localMediaStream;

      this.$id('video').prop('src', window.URL.createObjectURL(stream));
    },

    onCameraError: function(e)
    {
      stream = null;

      viewport.msg.show({
        type: 'error',
        time: 5000,
        text: '[CAMERA:' + e.name + ']' + (e.message.length ? (' ' + e.message) : '')
      });
    },

    setUpVideo: function()
    {
      this.$id('video').prop('src', window.URL.createObjectURL(stream));
    }

  });
});
