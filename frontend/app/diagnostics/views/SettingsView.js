// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'jquery',
  'underscore',
  'app/controller',
  'app/i18n',
  'app/core/View',
  'i18n!app/nls/diagnostics'
], function(
  $,
  _,
  controller,
  i18n,
  View
) {
  'use strict';

  return View.extend({

    localTopics: {
      'controller.tagValuesChanged': function(changes)
      {
        _.each(changes, this.updateState, this);
      }
    },

    events: {
      'change input': function(e)
      {
        var tagName = e.target.name;

        if (_.isUndefined(controller.values[tagName]))
        {
          return;
        }

        var value = parseFloat(e.target.value);

        if (value === controller.values[tagName])
        {
          return;
        }

        this.setSettingValue(tagName, value);
      }
    },

    initialize: function()
    {
      this.saveSettings = _.debounce(this.saveSettings.bind(this), 250);

      this.pendingChanges = {};
    },

    destroy: function()
    {
      this.saveSettings();
    },

    afterRender: function()
    {
      var view = this;

      this.$('[name]').each(function()
      {
        view.updateState(controller.getValue(this.name), this.name);

        var helpKey = 'SETTINGS:' + this.name + ':HELP';

        if (i18n.has('diagnostics', helpKey))
        {
          var $input = $(this);
          var $container = $input.closest('.input-append, .input-prepend');

          $('<span class="help-block"></span>')
            .html(i18n.translate('diagnostics', helpKey))
            .insertAfter($container.length ? $container : $input);
        }
      });
    },

    updateState: function(newValue, tagName)
    {
      this.$('input[name="' + tagName + '"]').val(newValue);
    },

    setSettingValue: function(tagName, newValue)
    {
      this.pendingChanges[tagName] = newValue;
      this.saveSettings();
    },

    saveSettings: function()
    {
      _.each(this.pendingChanges, function(value, tagName)
      {
        controller.setValue(tagName, value);
      });

      this.pendingChanges = {};
    }

  });
});
