// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/controller',
  'app/viewport',
  'app/core/View',
  'app/core/util/uuid',
  'app/dashboard/templates/printHidLabel'
], function(
  controller,
  viewport,
  View,
  uuid,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': 'onSubmit'
    },

    afterRender: function()
    {
      if (this.model.lastTest)
      {
        this.$id('orderNo').val(this.model.lastTest.get('orderNo'));
        this.$id('serialNo').val(this.model.lastTest.get('serialNo'));
      }
      else
      {
        this.$id('orderNo').val(controller.tags.getValue('currentOrder') || '');
      }
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);

      this.$id('orderNo').focus();
    },

    onSubmit: function(e)
    {
      e.preventDefault();

      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var req = view.ajax({
        method: 'POST',
        url: '/snf/tests;printHidLabel',
        data: JSON.stringify({
          requestId: uuid(),
          prodLine: controller.tags.getValue('prodLine'),
          orderNo: this.$id('orderNo').val(),
          serialNo: parseInt(this.$id('serialNo').val(), 10)
        })
      });

      req.fail(function()
      {
        if (req.statusText === 'abort')
        {
          return;
        }

        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: view.t('printHidLabel:failure')
        });
      });

      req.done(function()
      {
        view.closeDialog();

        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: view.t('printHidLabel:success')
        });
      });
    }

  });
});
