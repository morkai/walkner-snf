// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/controller',
  'app/data/programs',
  'app/core/View',
  'app/dashboard/templates/currentState'
], function(
  _,
  $,
  t,
  time,
  user,
  controller,
  programs,
  View,
  currentStateTemplate
) {
  'use strict';

  return View.extend({

    template: currentStateTemplate,

    localTopics: {
      'controller.tagValuesChanged': function(changes)
      {
        _.each(changes, this.updateState, this);
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('currentState');
    },

    destroy: function()
    {

    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      this.updateTagValue('current');
      this.updateTagValue('voltage');
      this.updateTagValue('temperature');
      this.updateTagValue('light.1');
      this.updateTagValue('light.2');
      this.updateCurrentExtremes(true);
      this.updateLightExtremes(true);
      this.updateTotalDuration();
    },

    updateState: function(newValue, tagName)
    {
      switch (tagName)
      {
        case 'light.1':
        case 'light.2':
        case 'current':
        case 'voltage':
        case 'temperature':
          this.updateTagValue(tagName);
          break;

        case 'program.current.min':
        case 'program.current.max':
          this.updateCurrentExtremes();
          break;

        case 'light.1.min.pc':
        case 'light.2.min.pc':
          this.updateLightExtremes();
          break;

        case 'program.hrsDuration':
        case 'program.hrsCount.pc':
        case 'program.hrsInterval.pc':
        case 'program.duration.pc':
          this.updateTotalDuration();
          return;
      }
    },

    $tag: function(tagName)
    {
      return this.$('.currentState-tag[data-tag="' + tagName + '"]');
    },

    updateTagValue: function(tagName, tagValue)
    {
      if (typeof tagValue === 'undefined')
      {
        tagValue = Math.max(controller.getValue(tagName), 0)
      }

      var $value = this.$tag(tagName).find('.currentState-tag-value');
      var suffix = $value.attr('data-suffix');
      var decimals = parseInt($value.attr('data-decimals') || 0);

      if (isNaN(tagValue) && typeof tagValue === 'number')
      {
        tagValue = '?';
      }
      else if (decimals > 0)
      {
        tagValue = tagValue.toFixed(decimals);
      }

      if (tagValue !== '?' && suffix && suffix.length)
      {
        tagValue += suffix;
      }

      $value.text(tagValue);
    },

    updateCurrentExtremes: function(noAnimation)
    {
      this.updateTagExtreme('current', 'min', 'program.current.min', noAnimation);
      this.updateTagExtreme('current', 'max', 'program.current.max', noAnimation);
    },

    updateLightExtremes: function(noAnimation)
    {
      this.updateTagExtreme('light.1', 'min', 'light.1.min.plc', noAnimation);
      this.updateTagExtreme('light.2', 'min', 'light.2.min.plc', noAnimation);
    },

    updateTagExtreme: function(valueTagName, extreme, extremeTagName, noAnimation)
    {
      var extremeTagValue = controller.getValue(extremeTagName);
      var $extreme = this.$tag(valueTagName).find('.currentState-tag-extreme.is-' + extreme);

      $extreme.text(extremeTagValue);

      var toggle = extremeTagValue > 0
        ? (noAnimation ? 'show' : 'fadeIn')
        : (noAnimation ? 'hide' : 'fadeOut');

      $extreme[toggle]();
    },

    updateTotalDuration: function()
    {
      var totalDuration = controller.getValue('program.duration.pc');
      var hrsCount = controller.getValue('program.hrsCount.pc');
      var hrsDuration = controller.getValue('program.hrsDuration');
      var hrsInterval = controller.getValue('program.hrsInterval.pc');

      totalDuration += (hrsInterval + hrsDuration) * hrsCount;

      this.updateTagValue('totalDuration', time.toString(totalDuration, true));
    }

  });
});
