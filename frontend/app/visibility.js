// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'jquery',
  'visibly',
  'app/broker'
], function(
  $,
  visibly,
  broker
) {
  'use strict';

  var visibility = {
    visible: !visibly.hidden()
  };

  visibly.onVisible(function()
  {
    visibility.visible = true;

    broker.publish('visibility.visible', visibility);
  });

  visibly.onHidden(function()
  {
    visibility.visible = false;

    broker.publish('visibility.hidden', visibility);
  });

  return visibility;
});
