// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'app/pubsub',
  'app/programs/ProgramCollection',
  './createStorage'
], function(
  _,
  pubsub,
  ProgramCollection,
  createStorage
) {
  'use strict';

  var programs = createStorage('PROGRAMS', 'programs', ProgramCollection);

  pubsub.subscribe('programs.*.images.*', function(message, topic)
  {
    var program = programs.get(message.program);

    if (!program)
    {
      return;
    }

    var images = program.get('images');
    var event = topic.split('.')[3];

    switch (event)
    {
      case 'added':
        images = images.concat(message.images);
        break;

      case 'deleted':
        images = images.filter(function(image) { return image._id !== message.image; });
        break;

      case 'edited':
        for (var i = 0; i < images.length; ++i)
        {
          var image = images[i];

          if (image._id === message.image._id)
          {
            images = [].concat(images);
            images[i] = message.image;

            break;
          }
        }
        break;
    }

    program.set('images', images, {action: event, message: message});
  });

  return programs;
});
