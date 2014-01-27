define([
  'app/i18n',
  'app/time',
  'app/core/util/bindLoadingMessage',
  'app/core/pages/DetailsPage',
  'app/core/views/DetailsView',
  'app/programs/Program',
  'app/programs/views/ProgramDetailsView',
  '../Test',
  '../views/TestChartsView',
  'app/tests/templates/detailsPage',
  'app/tests/templates/details'
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

    pageId: 'testDetails',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound(this.model.nlsDomain, 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        t.bound(this.model.nlsDomain, 'BREADCRUMBS:details')
      ];
    },

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

      this.testDetailsView.serialize = function()
      {
        var model = this.model.toJSON();

        model.duration =
          time.toString((Date.parse(model.finishedAt) - Date.parse(model.startedAt)) / 1000);

        model.startedAt = time.format(model.startedAt, 'YYYY-MM-DD HH:mm:ss');
        model.finishedAt = time.format(model.finishedAt, 'YYYY-MM-DD HH:mm:ss');

        return {
          model: model
        };
      };

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
