// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/core/pages/DetailsPage',
  '../views/ProgramDetailsView',
  '../views/ProgramGalleryView',
  'app/programs/templates/detailsPage'
], function(
  DetailsPage,
  ProgramDetailsView,
  ProgramGalleryView,
  template
) {
  'use strict';

  return DetailsPage.extend({

    template: template,

    initialize: function()
    {
      DetailsPage.prototype.initialize.call(this);
    },

    defineViews: function()
    {
      this.detailsView = new ProgramDetailsView({model: this.model});
      this.galleryView = new ProgramGalleryView({model: this.model});

      this.setView('.programs-container-details', this.detailsView);
      this.setView('.programs-container-gallery', this.galleryView);
    },

    load: function(when)
    {
      return when();
    }

  });
});
