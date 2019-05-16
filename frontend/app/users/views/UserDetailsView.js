// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/users/templates/details'
], function(
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    localTopics: {
      'companies.synced': 'render',
      'aors.synced': 'render'
    }

  });
});
