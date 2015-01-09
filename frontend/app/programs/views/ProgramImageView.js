// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/programs/templates/image',
  'jquery.kinetic'
], function(
  _,
  $,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'programs-image-dialog',

    events: {
      'dblclick': function()
      {
        viewport.closeDialog();
      }
    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 25);

      $(window).on('resize', this.onResize);
    },

    destroy: function()
    {
      $(window).off('resize', this.onResize);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        programId: this.model.programId,
        image: this.model.image
      }
    },

    afterRender: function()
    {
      this.resize();
      this.$el.kinetic();
    },

    resize: function()
    {
      this.$el.css({
        maxWidth: (window.innerWidth - 90) + 'px',
        maxHeight: (window.innerHeight - 90) + 'px'
      });
    }

  });
});
