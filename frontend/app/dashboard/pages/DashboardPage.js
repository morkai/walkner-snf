// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/Model',
  'app/core/util/embedded',
  'app/snf-tests/views/TestListView',
  'app/snf-tests/TestCollection',
  '../views/AssignProgramsView',
  '../views/PrintHidLabelView',
  '../views/CameraView',
  '../views/CurrentProgramView',
  '../views/CurrentStateView',
  '../views/ImageGalleryView',
  '../Dashboard',
  'app/snf-tests/Test',
  'app/dashboard/templates/dashboard'
], function(
  $,
  t,
  user,
  viewport,
  View,
  Model,
  embedded,
  TestListView,
  TestCollection,
  AssignProgramsView,
  PrintHidLabelView,
  CameraView,
  CurrentProgramView,
  CurrentStateView,
  ImageGalleryView,
  Dashboard,
  Test,
  dashboardTemplate
) {
  'use strict';

  return View.extend({

    template: dashboardTemplate,

    layoutName: 'page',

    remoteTopics: {
      'snf.tests.started': function(test)
      {
        this.model.set('currentTest', test ? new Test(test) : null);
        this.model.update();
      },
      'snf.tests.finished': function(test)
      {
        this.model.set({
          currentTest: null,
          lastTest: test ? new Test(test) : null
        });
        this.model.update();
      }
    },

    actions: function()
    {
      var actions = [{
        className: 'dashboard-action-gallery',
        label: this.t('gallery:pageAction'),
        icon: 'image',
        callback: this.showImageGalleryDialog.bind(this)
      }];

      if (user.data.local || user.isAllowedTo('SNF:MANAGE'))
      {
        actions.push({
          label: this.t('assignPrograms:pageAction'),
          icon: 'plus',
          callback: this.showAssignProgramsDialog.bind(this)
        }, {
          label: this.t('printHidLabel:pageAction'),
          icon: 'print',
          callback: this.showPrintHidLabelDialog.bind(this)
        });
      }

      return actions;
    },

    initialize: function()
    {
      this.model = new Dashboard();

      this.tests = new TestCollection(null, {
        paginate: false
      });
      this.tests.rqlQuery.limit = 10;

      this.currentProgramView = new CurrentProgramView({model: this.model});

      this.currentStateView = new CurrentStateView();

      this.testListView = new TestListView({
        collection: this.tests,
        columns: [
          {id: 'program'},
          {id: 'orderNo', className: 'is-min'},
          {id: 'serialNo', className: 'is-min is-number'},
          {id: 'startedAt', className: 'is-min'},
          {id: 'duration', className: 'is-min'}
        ]
      });

      this.setView('#-program', this.currentProgramView);
      this.setView('#-state', this.currentStateView);
      this.setView('#-tests', this.testListView);

      if (user.data.local)
      {
        this.cameraView = new CameraView();

        this.setView('#-camera', this.cameraView);
      }

      this.listenTo(this.model, 'change:currentProgram', this.toggleGalleryAction);
    },

    getTemplateData: function()
    {
      return {
        local: !!user.data.local
      };
    },

    load: function(when)
    {
      return when(
        this.model.fetch(),
        this.tests.fetch({reset: true})
      );
    },

    afterRender: function()
    {
      this.toggleGalleryAction();

      if (window.IS_EMBEDDED)
      {
        embedded.render(this);

        window.parent.postMessage({type: 'ready', app: 'snf'}, '*');
      }
    },

    showAssignProgramsDialog: function()
    {
      var dialogView = new AssignProgramsView({
        model: {
          nlsDomain: this.model.nlsDomain
        }
      });

      viewport.showDialog(dialogView, this.t('assignPrograms:dialogTitle'));
    },

    showPrintHidLabelDialog: function()
    {
      var dialogView = new PrintHidLabelView({
        model: {
          nlsDomain: this.model.nlsDomain,
          lastTest: this.tests.find(function(test)
          {
            return !!test.get('orderNo') && test.get('serialNo') > 0;
          })
        }
      });

      viewport.showDialog(dialogView, this.t('printHidLabel:dialogTitle'));
    },

    showImageGalleryDialog: function()
    {
      var program = this.model.get('currentProgram');

      if (program && program.get('images').length)
      {
        viewport.showDialog(new ImageGalleryView({model: program}));
      }
    },

    onImagesChanged: function(program)
    {
      var currentProgram = this.model.get('currentProgram');

      if (!currentProgram || program.id === currentProgram.id)
      {
        this.toggleGalleryAction();
      }
    },

    toggleGalleryAction: function()
    {
      var program = this.model.get('currentProgram');

      $('.dashboard-action-gallery').attr('disabled', !program || !program.get('images').length);
    }

  });
});
