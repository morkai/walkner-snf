// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/controller',
  'app/core/View',
  'app/dashboard/views/OrderPickerDialogView',
  'app/dashboard/templates/currentProgram'
], function(
  _,
  $,
  t,
  user,
  time,
  viewport,
  controller,
  View,
  OrderPickerDialogView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-orderNo': function()
      {
        var dialogView = new OrderPickerDialogView({
          model: this.model
        });

        this.listenTo(dialogView, 'picked', function(data)
        {
          controller.tags.setValue('currentOrder', data.orderNo);
          controller.tags.setValue('currentQty', {
            qtyTodo: data.qtyTodo,
            qtyDone: 0
          });

          viewport.closeDialog();
        });

        viewport.showDialog(dialogView, this.t('orderPicker:title'));
      }
    },

    localTopics: {
      'controller.valuesChanged': function(changes)
      {
        _.forEach(changes, this.updateState, this);
      }
    },

    initialize: function()
    {
      View.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model, 'change:status', this.updateStatus);
      this.listenTo(this.model, 'change:currentTest', this.updateProgressBar);
      this.listenTo(this.model, 'change:currentProgram', function()
      {
        this.updateProgramName();
        this.updateProgressBar();
      });
    },

    afterRender: function()
    {
      this.updateCurrentOrder();
      this.updateStatus();
      this.updateProgramName();
      this.updateProgressBar();
    },

    updateState: function(newValue, tagName)
    {
      switch (tagName)
      {
        case 'test.elapsedTime':
        case 'test.hrsIntervalTime':
        case 'test.hrsElapsedTime':
        case 'test.hrsIteration':
          this.updateProgressValue();
          break;

        case 'currentOrder':
        case 'currentQty':
          this.updateCurrentOrder();
          break;
      }
    },

    updateStatus: function()
    {
      var $status = this.$('.currentProgram-status').removeClass('is-offline is-online is-testing');

      $status.addClass('is-' + this.model.get('status'));
    },

    updateProgramName: function()
    {
      var program = this.model.get('currentProgram');

      this.$id('name').text(
        program ? program.get('name') : t('dashboard', 'currentProgram:noProgram')
      );
    },

    updateProgressBar: function()
    {
      var program = this.model.get('currentProgram');
      var hrsCount = program ? program.get('hrsCount') : 0;
      var $progress = this.$('.currentProgram-progress');

      $progress.find('.currentProgram-progress-hrs').remove();

      for (var i = 0; i < hrsCount; ++i)
      {
        var $hrs = $('<div class="currentProgram-progress-hrs"></div>');

        $hrs.text(program.get('hrsTime') + program.get('hrsInterval'));

        $progress.append($hrs);
      }

      this.updateProgressValue();
    },

    updateProgressValue: function()
    {
      var program = this.model.get('currentProgram');

      if (program)
      {
        if (this.model.isTesting())
        {
          var hrsIteration = controller.tags.getValue('test.hrsIteration');
          var hrsIntervalTime = controller.tags.getValue('test.hrsIntervalTime');
          var hrsElapsedTime = controller.tags.getValue('test.hrsElapsedTime');

          if (hrsIteration > 0 || hrsIntervalTime > 0 || hrsElapsedTime > 0)
          {
            this.setProgressBarValue(100, null);
            this.updateHrsProgress();
          }
          else
          {
            this.updateProgressBarValue();
            this.updateHrsProgress();
          }
        }
        else
        {
          this.setProgressBarValue(0, program.get('illuminationTime'));
        }
      }
      else
      {
        this.setProgressBarValue(0, null);
      }
    },

    updateProgressBarValue: function()
    {
      var elapsedTime = controller.tags.getValue('test.elapsedTime');
      var illuminationTime = this.model.get('currentProgram').get('illuminationTime');

      this.setProgressBarValue(
        Math.min(elapsedTime * 100 / illuminationTime, 100),
        Math.max(illuminationTime - elapsedTime, 0)
      );
    },

    setProgressBarValue: function(percent, remainingTime)
    {
      this.$('.progress-bar').css('width', percent + '%');
      this.$('.currentProgram-progress-value')
        .text(remainingTime === null ? '' : time.toString(remainingTime))
        .toggleClass('is-halfway', percent > 60);
    },

    updateHrsProgress: function()
    {
      var program = this.model.get('currentProgram');

      var hrsCount = program.get('hrsCount');
      var hrsTime = program.get('hrsTime');
      var hrsInterval = program.get('hrsInterval');

      var hrsIteration = controller.tags.getValue('test.hrsIteration');
      var hrsIntervalTime = controller.tags.getValue('test.hrsIntervalTime');
      var hrsElapsedTime = controller.tags.getValue('test.hrsElapsedTime');
      var reset = hrsIteration === 0 && hrsIntervalTime === 0 && hrsElapsedTime === 0;
      var iterationStart = hrsElapsedTime === 0 && hrsIntervalTime === hrsInterval;

      if (hrsElapsedTime > 0 || iterationStart)
      {
        hrsIteration -= 1;
      }

      var $hrsBoxes = this.$('.currentProgram-progress-hrs');

      for (var i = 0; i < hrsCount; ++i)
      {
        var $hrsBox = $hrsBoxes.eq(i).removeClass('is-waiting is-on is-finished');

        if (reset || i > hrsIteration)
        {
          $hrsBox.text(hrsInterval + hrsTime);
        }
        else if (i < hrsIteration)
        {
          $hrsBox.addClass('is-finished').text('');
        }
        else if (hrsElapsedTime === 0 && !iterationStart)
        {
          $hrsBox.addClass('is-waiting').text(Math.max(hrsInterval - hrsIntervalTime, 0));
        }
        else
        {
          $hrsBox.addClass('is-on').text(Math.max(hrsTime - hrsElapsedTime, 0));
        }
      }
    },

    updateCurrentOrder: function()
    {
      var currentOrder = controller.tags.getValue('currentOrder') || this.t('currentProgram:order:empty');
      var currentQty = controller.tags.getValue('currentQty') || {
        qtyDone: 0,
        qtyTodo: 0
      };

      this.$id('orderNo').text(currentOrder);
      this.$id('qtyDone').text(currentQty.qtyTodo > 0 && currentQty.qtyDone >= 0 ? currentQty.qtyDone : '0');
      this.$id('qtyTodo').text(currentQty.qtyTodo || '?');
    }

  });
});
