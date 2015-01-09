// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/dashboard/templates/gallery'
], function(
  _,
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'dashboard-gallery-dialog',

    template: template,

    events: {
      'click .dashboard-gallery-thumbnail': function(e)
      {
        this.$('.is-active').removeClass('is-active');

        var $thumbnail = this.$(e.currentTarget).addClass('is-active');
        var $img = $thumbnail.find('img');

        this.$id('image').attr('src', $img.attr('src'));
        this.$id('label').text($img.attr('alt'));
      },
      'dblclick #-preview': function()
      {
        this.closeDialog();
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
        programId: this.model.id,
        images: this.model.get('images')
      };
    },

    afterRender: function()
    {
      this.resize();
      this.$id('thumbnails').kinetic();
      this.$id('preview').kinetic();
    },

    resize: function()
    {
      this.$id('preview').css({
        height: (window.innerHeight - 190) + 'px'
      });
    },

    closeDialog: function() {},

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    }

  });
});
