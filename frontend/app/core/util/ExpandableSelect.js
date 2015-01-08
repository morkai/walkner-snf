// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'jquery',
  'underscore'
], function(
  $,
  _
) {
  'use strict';

  var PLUGIN_NAME = 'expandableSelect';

  function ExpandableSelect($el, options)
  {
    this.$el = $el;

    this.$helper = null;

    this.options = options;

    this.$el
      .on('mousedown.' + PLUGIN_NAME, this.onMouseDown.bind(this))
      .on('keydown.' + PLUGIN_NAME, this.onKeyDown.bind(this))
      .on('focus.' + PLUGIN_NAME, this.onFocus.bind(this))
      .on('blur.' + PLUGIN_NAME, this.onBlur.bind(this));
  }

  ExpandableSelect.prototype = {

    destroy: function()
    {
      this.collapse();

      this.$el.off('.' + PLUGIN_NAME);
      this.$el = null;
    },

    isExpanded: function()
    {
      return this.$el.hasClass(this.options.isExpandedClassName);
    },

    expand: function()
    {
      if (this.isExpanded())
      {
        return;
      }

      var width = this.$el.css('width');
      var pos = this.$el.position();

      this.$helper = this.options.createHelperElement(this.$el);
      this.$helper.css({
        width: width,
        opacity: 0
      });
      this.$helper.insertAfter(this.$el);

      var length = this.$el.prop('length') + this.$el.find('optgroup').length;
      var size = this.options.expandedLength || parseInt(this.$el.attr('data-expanded-length'), 10) || length;

      this.$el.prop('size', size > length ? length : size);
      this.$el.css({
        top: pos.top + 'px',
        left: pos.left + 'px',
        width: width
      });
      this.$el.addClass(this.options.isExpandedClassName);
    },

    collapse: function()
    {
      if (!this.isExpanded())
      {
        return;
      }

      this.$helper.remove();
      this.$helper = null;

      this.$el.prop('size', 1);
      this.$el.removeClass(this.options.isExpandedClassName);
    },

    onMouseDown: function(e)
    {
      if (this.isExpanded())
      {
        return;
      }

      this.expand();

      _.defer(this.$el.focus.bind(this.$el));

      e.preventDefault();
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.$el.blur();

        return false;
      }
    },

    onFocus: function()
    {
      this.expand();
    },

    onBlur: function()
    {
      this.collapse();
    }

  };

  $.fn[PLUGIN_NAME] = function()
  {
    var result;
    var options = null;
    var methodName = null;
    var methodArgs = null;

    if (arguments.length !== 0 && _.isString(arguments[0]))
    {
      methodArgs = Array.prototype.slice.call(arguments);
      methodName = methodArgs.shift();
    }
    else
    {
      options = _.defaults({}, arguments[0], $.fn[PLUGIN_NAME].defaults);
    }

    this.each(function()
    {
      var $el = $(this);
      var expandableSelect = $el.data(PLUGIN_NAME);

      if (expandableSelect)
      {
        if (methodName !== null)
        {
          result = expandableSelect[methodName].apply(expandableSelect, methodArgs);

          if (result === undefined)
          {
            result = null;
          }

          return;
        }

        expandableSelect.destroy();
      }

      $el.data(PLUGIN_NAME, new ExpandableSelect($el, options));
    });

    return result === undefined ? this : result;
  };

  $.fn[PLUGIN_NAME].defaults = {
    isExpandedClassName: 'is-expanded',
    createHelperElement: function($el)
    {
      return $('<div></div>').attr('class', $el.attr('class'));
    },
    expandedLength: 0
  };

  return ExpandableSelect;
});