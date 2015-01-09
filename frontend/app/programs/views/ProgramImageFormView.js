// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/programs/templates/imageForm'
], function(
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': function()
      {
        var $label = this.$id('label');
        var $primary = this.$('.btn-primary').attr('disabled', true);

        var req = this.ajax({
          type: 'PUT',
          url: this.el.action,
          data: JSON.stringify({label: $label.val()})
        });

        req.done(this.onFormSuccess.bind(this));

        req.fail(function()
        {
          $primary.attr('disabled', false);

          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('programs', 'gallery:edit:failure')
          });

          $label.focus();
        });

        return false;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        programId: this.model.programId,
        image: this.model.image
      };
    },

    onFormSuccess: function()
    {

    },

    onDialogShown: function(viewport)
    {
      this.onFormSuccess = viewport.closeDialog.bind(viewport);
    }

  });
});
