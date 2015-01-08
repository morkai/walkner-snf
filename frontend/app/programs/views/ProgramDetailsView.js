// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/core/views/DetailsView',
  '../Program',
  'app/programs/templates/details'
], function(
  DetailsView,
  Program,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    serialize: function()
    {
      return _.extend(DetailsView.prototype.serialize.call(this), {
        contactors: Program.CONTACTORS
      });
    }

  });
});
