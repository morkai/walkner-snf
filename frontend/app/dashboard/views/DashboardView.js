define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/i18n',
  'app/user',
  'app/controller',
  'app/data/programs',
  'app/core/View',
  'app/dashboard/templates/dashboard'
], function(
  _,
  $,
  viewport,
  t,
  user,
  controller,
  programs,
  View,
  dashboardTemplate
) {
  'use strict';

  navigator.getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia
    || navigator.msGetUserMedia;

  var stream;

  function toPercent(val)
  {
    return (val * 100 / 255).toFixed(2) + '%';
  }

  function filterGrayscale(context)
  {
    var imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    var data = imageData.data;

    for (var i=0, l=data.length; i < l; i += 4)
    {
      var v = data[i] * .3 + data[i + 1] * .5 + data[i + 2] * .15;

      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }

    context.putImageData(imageData, 0, 0);
  }

  return View.extend({

    template: dashboardTemplate,

    localTopics: {
      'controller.tagValuesChanged': function(changes)
      {
        _.each(changes, this.updateState, this);
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('dashboard');
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
      if (user.data.local)
      {
        this.setUpCamera();
      }
      else
      {
        this.$id('camera').remove();
      }
    },

    updateState: function(newValue, tagName)
    {

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

      this.setUpVideo();
    },

    onCameraError: function(e)
    {
      stream = null;

      console.error(e);

      viewport.msg.show({
        type: 'error',
        time: 5000,
        text: '[CAMERA:' + e.name + ']' + (e.message.length ? (' ' + e.message) : '')
      });
    },

    setUpVideo: function()
    {
      var $video = this.$id('video');
      var $snapshot = this.$id('snapshot');

      var w = parseInt($video.prop('width'), 10);
      var h = parseInt($video.prop('height'), 10);

      $snapshot.prop('width', w);
      $snapshot.prop('height', h);

      $video.prop('src', window.URL.createObjectURL(stream));

      $snapshot.on('mousemove', this.onSnapshotMouseMove.bind(this));

      this.$id('control').click(function()
      {
        var $icon = $(this.querySelector('.fa'));

        if ($icon.hasClass('fa-play'))
        {
          $icon.removeClass('fa-play').addClass('fa-pause');
          $video[0].play();
        }
        else
        {
          $icon.removeClass('fa-pause').addClass('fa-play');
          $video[0].pause();
        }
      });

      this.context = $snapshot[0].getContext('2d');

      this.timers.snapshot = setInterval(
        function(view)
        {
          view.context.drawImage($video[0], 0, 0, w, h);

          if (view.$id('grayscale').hasClass('active'))
          {
            filterGrayscale(view.context);
          }
        },
        1000 / 5,
        this
      );
    },

    onSnapshotMouseMove: function(e)
    {
      var rgb = this.context.getImageData(e.offsetX, e.offsetY, 1, 1).data;
      var r = rgb[0];
      var g = rgb[1];
      var b = rgb[2];

      this.$id('camera').css('background-color', 'rgb(' + r + ',' + g + ',' + b + ')');

      var lum1 = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
      var lum2 = 0.299 * r + 0.587 * g + 0.114 * b;
      var lum3 =
        Math.sqrt(0.241 * Math.pow(r, 2) + 0.691 * Math.pow(g, 2) + 0.068 * Math.pow(b, 2));

      this.$id('lum1').text(lum1.toFixed(2) + ' -> ' + toPercent(lum1));
      this.$id('lum2').text(lum2.toFixed(2) + ' -> ' + toPercent(lum2));
      this.$id('lum3').text(lum3.toFixed(2) + ' -> ' + toPercent(lum3));

      this.$('.dashboard-lums').css('color', lum1 > 99 ? '#000' : '#fff');
    }

  });
});
