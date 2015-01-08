// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'jquery',
  'moment',
  'app/i18n',
  'app/controller',
  'app/viewport',
  'app/core/View',
  'app/diagnostics/TagsCollection',
  'app/diagnostics/templates/tags',
  'jquery.transit',
  'i18n!app/nls/diagnostics'
], function(
  _,
  $,
  moment,
  t,
  controller,
  viewport,
  View,
  TagsCollection,
  tagsTemplate
) {
  'use strict';

  return View.extend({

    template: tagsTemplate,

    localTopics: {
      'controller.tagValuesChanged': function(changes)
      {
        _.each(changes, this.updateState, this);
      }
    },

    remoteTopics: {
      'controller.tagsChanged': function(tags)
      {
        this.collection.reset(tags);
      }
    },

    events: {
      'click .tag-value': function(e)
      {
        this.setTagValue($(e.target));
      },
      'click th': function(e)
      {
        this.sort($(e.target).attr('data-sort-property'));
      }
    },

    initialize: function()
    {
      this.listenTo(this.collection, 'reset', this.render);
      this.listenTo(this.collection, 'sort', this.render);
    },

    serialize: function()
    {
      var formatValue = this.formatValue.bind(this);

      return {
        tags: this.collection.map(function(tag)
        {
          tag = tag.toJSON();
          tag.value = formatValue(controller.values[tag.name], tag.type);

          if (tag.unit === null || tag.unit === -1)
          {
            tag.unit = '-';
          }

          if (tag.address === null || tag.address === -1)
          {
            tag.address = '-';
          }

          return tag;
        })
      };
    },

    destroy: function()
    {
      this.collection = null;
    },

    sort: function(property)
    {
      this.collection.comparator = function(a, b)
      {
        if (a.get(property) < b.get(property))
        {
          return -1;
        }
        else if (a.get(property) > b.get(property))
        {
          return 1;
        }
        else
        {
          return 0;
        }
      };

      this.collection.sort();
    },

    updateState: function(newValue, tagName)
    {
      var $tagValue = this.$('tr[data-tag="' + tagName + '"] .tag-value');

      if ($tagValue.length === 0 || $tagValue.is('.tag-changing'))
      {
        return;
      }

      $tagValue.removeClass('highlight');
      $tagValue.text(this.formatValue(newValue, this.collection.get(tagName).get('type')));

      _.defer(function() { $tagValue.addClass('highlight'); });
    },

    formatValue: function(value, type)
    {
      /*jshint -W015*/

      switch (type)
      {
        case 'time':
          return moment(value || 0).format('YYYY-MM-DD HH:mm:ss');

        default:
          return value === null || typeof value === 'undefined' ? '?' : String(value);
      }
    },

    setTagValue: function($tagValue)
    {
      if ($tagValue.hasClass('tag-changing') || $tagValue.hasClass('tag-not-writable'))
      {
        return;
      }

      $tagValue.addClass('tag-changing');

      var tagName = $tagValue.closest('tr').attr('data-tag');
      var tag = this.collection.get(tagName);

      if (tag.get('type') === 'bool')
      {
        this.setBoolValue($tagValue, tagName, !controller.values[tagName]);
      }
      else
      {
        this.showEditor(tag, $tagValue);
      }
    },

    setBoolValue: function($tagValue, tagName, newValue)
    {
      var view = this;

      controller.setValue(tagName, newValue, function(err)
      {
        if (err)
        {
          view.showErrorMessage(err, tagName, newValue);
        }

        $tagValue.removeClass('tag-changing');
      });
    },

    showEditor: function(tag, $tagValue)
    {
      var pos = $tagValue.position();

      var $form = $('<form class="input-group"></form>')
        .css({
          position: 'absolute',
          top: pos.top + 2 + 'px',
          left: pos.left + 'px',
          width: $tagValue.outerWidth() + 'px'
        });

      var $value = $('<input class="form-control" name="value" type="text">');

      $form.append($value.val(controller.values[tag.get('name')]));
      $form.append('<div class="input-group-btn"><input class="btn btn-default" type="submit" value="&gt;"></div>');

      var view = this;

      $form.submit(function()
      {
        var rawValue = $value.val().trim();
        var newValue;

        if (/^[0-9]+$/.test(rawValue))
        {
          newValue = parseInt(rawValue, 10);
        }
        else if (/^[0-9]+\.[0-9]+$/.test(rawValue))
        {
          newValue = parseFloat(rawValue);
        }
        else
        {
          newValue = rawValue;
        }

        var tagName = tag.get('name');

        controller.setValue(tagName, newValue, function(err)
        {
          if (err)
          {
            view.showErrorMessage(err, tagName, newValue);
          }

          $tagValue.removeClass('tag-changing');
        });

        $form.fadeOut(function() { $form.remove(); });

        return false;
      });

      $value.on('keyup', function(e)
      {
        if (e.which === 27)
        {
          $tagValue.removeClass('tag-changing');

          $form.fadeOut(function() { $form.remove(); });

          return false;
        }
      });

      $tagValue.append($form);

      $value.select();
    },

    showErrorMessage: function(err, tagName, value)
    {
      viewport.msg.show({
        time: 3000,
        type: 'error',
        text: t('diagnostics', 'TAG_WRITE_FAILED', {
          tag: tagName,
          value: value,
          reason: t('diagnostics', err.code || err.message)
        })
      });
    }
  });
});
