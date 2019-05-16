// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/core/views/DetailsView',
  'app/snf-programs/Program',
  'app/snf-programs/views/DetailsView',
  '../Test',
  '../views/TestChartsView',
  'app/snf-tests/templates/detailsPage',
  'app/snf-tests/templates/details'
], function(
  t,
  time,
  bindLoadingMessage,
  DetailsPage,
  DetailsView,
  Program,
  ProgramDetailsView,
  Test,
  TestChartsView,
  detailsPageTemplate,
  detailsTemplate
) {
  'use strict';

  return DetailsPage.extend({

    template: detailsPageTemplate,

    actions: [],

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.defineViews();

      this.listenTo(this.model, 'change:program', function()
      {
        this.programDetailsView.model.set(this.model.get('program'));
      });

      this.setView('.tests-details-container', this.testDetailsView);
      this.setView('.tests-program-container', this.programDetailsView);
      this.setView('.tests-charts-container', this.testChartsView);
    },

    defineViews: function()
    {
      this.testDetailsView = new DetailsView({
        template: detailsTemplate,
        model: this.model
      });

      this.programDetailsView = new ProgramDetailsView({
        model: new Program()
      });

      this.testChartsView = new TestChartsView({model: this.model});
    },

    load: function(when)
    {
      return when(this.model.fetch());
    }

  });
});
