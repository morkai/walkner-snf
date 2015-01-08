// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var lodash = require('lodash');
var setUpControllerRoutes = require('./routes');

exports.DEFAULT_CONFIG = {
  messengerClientId: 'messenger/client',
  sioId: 'sio',
  mongooseId: 'mongoose',
  userId: 'user',
  expressId: 'express'
};

exports.start = function startControllerModule(app, module)
{
  var messengerClient = app[module.config.messengerClientId];

  if (!messengerClient)
  {
    throw new Error("controller module requires the messenger/client module!");
  }

  module.values = {};
  module.tags = [];

  app.onModuleReady(module.config.sioId, setUpClientMessages);
  app.onModuleReady(
    [
      module.config.mongooseId,
      module.config.userId,
      module.config.expressId
    ],
    setUpControllerRoutes.bind(null, app, module)
  );

  setUpServerMessages();

  if (messengerClient.isConnected())
  {
    setImmediate(sync);
  }

  app.broker
    .subscribe('messenger.client.connected', sync)
    .setFilter(function(message)
    {
      return message.socketType === 'req' && message.moduleName === module.config.messengerClientId;
    });

  app.broker.subscribe('app.prepareFrontendData', function(appData)
  {
    appData.TAG_VALUES = JSON.stringify(module.values);
  });

  /**
   * @private
   */
  function sync()
  {
    messengerClient.request('modbus.sync', null, function(err, res)
    {
      if (!lodash.isObject(res))
      {
        return;
      }

      if (res.tags)
      {
        module.info("Synced tag definitions.");

        handleTagsChangedMessage(res.tags);
      }

      if (res.values)
      {
        module.info("Synced tag values.");

        handleTagValuesChangedMessage(res.values);
      }
    });
  }

  /**
   * @private
   */
  function setUpClientMessages()
  {
    app[module.config.sioId].sockets.on('connection', function(socket)
    {
      socket.on('controller.setTagValue', handleSetTagValueMessage.bind(null, socket));
    });
  }

  /**
   * @private
   */
  function setUpServerMessages()
  {
    app.broker.subscribe('modbus.tagsChanged', handleTagsChangedMessage);

    app.broker.subscribe('modbus.tagValuesChanged', handleTagValuesChangedMessage);
  }

  /**
   * @private
   * @param {object.<string, object>} tags
   */
  function handleTagsChangedMessage(tags)
  {
    if (!lodash.isObject(tags))
    {
      return;
    }

    module.tags = tags;

    app.broker.publish('controller.tagsChanged', lodash.values(tags));
  }

  /**
   * @private
   * @param {object.<string, number|null>} values
   */
  function handleTagValuesChangedMessage(values)
  {
    if (!lodash.isObject(values))
    {
      return;
    }

    lodash.forEach(values, function(tagValue, tagName)
    {
      module.values[tagName] = tagValue;
    });

    app.broker.publish('controller.tagValuesChanged', values);
  }

  /**
   * @private
   * @param {object} socket
   * @param {string} tagName
   * @param {string|number} tagValue
   * @param {function} reply
   */
  function handleSetTagValueMessage(socket, tagName, tagValue, reply)
  {
    if (!lodash.isFunction(reply))
    {
      reply = function() {};
    }

    var user = socket.handshake.user;

    if (!user.super
      && !user.local
      && (!Array.isArray(user.privileges) || user.privileges.indexOf('DIAGNOSTICS:MANAGE') === -1))
    {
      return reply({
        message: "Not allowed.",
        code: 'TAG_WRITE_NO_PERM'
      });
    }

    if (!lodash.isString(tagName))
    {
      return reply({
        message: "Tag name must be a string.",
        code: 'TAG_WRITE_INVALID_NAME'
      });
    }
    else if (!lodash.isString(tagValue)
      && !lodash.isNumber(tagValue)
      && !lodash.isBoolean(tagValue))
    {
      return reply({
        message: "Tag value must be a string, a number or a boolean.",
        code: 'TAG_WRITE_INVALID_VALUE'
      });
    }

    var tag = module.tags[tagName];

    if (!tag)
    {
      return reply({
        message: "Unknown tag.",
        code: 'TAG_WRITE_UNKNOWN'
      });
    }

    if (!tag.writable)
    {
      return reply({
        message: "Tag's not writable.",
        code: 'TAG_WRITE_NOT_WRITABLE'
      });
    }

    var oldValue = module.values[tagName];

    messengerClient.request(
      'modbus.setTagValue',
      {name: tagName, value: tagValue},
      function(err)
      {
        reply(err);

        if (err)
        {
          module.error("Failed to set tag %s to %s: %s", tagName, tagValue, err.message);
        }
        else
        {
          module.info("Tag %s was set to %s", tagName, tagValue);

          var topic = 'controller.' + (tag.kind === 'setting' ? 'settingChanged' : 'tagValueSet');

          app.broker.publish(topic, {
            severity: 'debug',
            user: user,
            tag: tagName,
            newValue: tagValue,
            oldValue: oldValue
          });
        }
      }
    );
  }
};
