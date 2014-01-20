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
