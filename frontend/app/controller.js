// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/broker',
  'app/pubsub',
  'app/user',
  'app/tags/TagCollection'
], function(
  _,
  $,
  broker,
  pubsub,
  user,
  TagCollection
) {
  'use strict';

  var pendingTagChanges = [];
  var controller = {};

  controller.auth = {

    isEmbedded: function()
    {
      return window.location.hostname === 'localhost'
        || (window !== window.parent && window.navigator.userAgent.indexOf('X11; Linux') !== -1);
    }

  };

  controller.tags = new TagCollection([], {paginate: false});

  controller.loaded = false;
  controller.loading = null;
  controller.load = function()
  {
    if (controller.loaded)
    {
      return $.Deferred().resolve().promise(); // eslint-disable-line new-cap
    }

    if (controller.loading)
    {
      return controller.loading;
    }

    return load();
  };

  function load()
  {
    if (controller.loading)
    {
      return;
    }

    var tagsReq = $.ajax({url: _.result(controller.tags, 'url')}).done(function(res) { resetTags(res.collection);});

    controller.loading = $.when(tagsReq);

    controller.loading.done(function()
    {
      controller.loaded = true;
    });

    controller.loading.always(function()
    {
      controller.loading = null;
    });

    return controller.loading;
  }

  function resetTags(newTags)
  {
    var changes = {};
    var silent = {silent: true};

    if (controller.tags.length === 0 || Object.keys(newTags).length !== controller.tags.length)
    {
      controller.tags.reset(newTags, silent);

      _.forEach(newTags, function(newTag)
      {
        changes[newTag.name] = newTag.value;
      });
    }
    else
    {
      _.forEach(newTags, function(newTag)
      {
        var oldTag = controller.tags.get(newTag.name);
        var oldValue;

        if (oldTag)
        {
          oldValue = oldTag.get('value');
          oldTag.set(newTag, silent);
        }
        else
        {
          controller.tags.add(newTag, silent);
        }

        if (newTag.value !== oldValue)
        {
          changes[newTag.name] = newTag.value;
        }
      });
    }

    _.forEach(pendingTagChanges, function(pendingChange)
    {
      var changeTime = pendingChange.time;

      _.forEach(pendingTagChanges.newValues, function(newValue, tagName)
      {
        var tag = controller.tags.get(tagName);

        if (tag && changeTime > tag.get('lastChangeTime'))
        {
          tag.set({
            lastChangeTime: changeTime,
            value: newValue
          }, silent);

          changes[tagName] = newValue;
        }
      });
    });

    pendingTagChanges = [];

    controller.tags.trigger('reset');

    if (!_.isEmpty(changes))
    {
      broker.publish('controller.valuesChanged', changes);
    }
  }

  broker.subscribe('socket.connected', function() { load(); });

  pubsub.subscribe('controller.tagsChanged', function(tags) { resetTags(tags); });

  pubsub.subscribe('controller.tagValuesChanged', function(newValues)
  {
    if (controller.loading)
    {
      pendingTagChanges.push({
        time: newValues['@timestamp'],
        newValues: newValues
      });

      return;
    }

    var changes = {};

    _.forEach(newValues, function(newValue, tagName)
    {
      var tag = controller.tags.get(tagName);

      if (tag && !_.isEqual(newValue, tag.get('value')))
      {
        tag.set('value', newValue);
        changes[tagName] = newValue;
      }
    });

    if (!_.isEmpty(changes))
    {
      broker.publish('controller.valuesChanged', changes);
    }
  });

  window.controller = controller;

  return controller;
});
