// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/data/programs',
  'app/core/View',
  'app/core/Model',
  'app/programs/views/AssignProgramsView',
  'app/tests/views/TestListView',
  'app/tests/TestCollection',
  '../views/CameraView',
  '../views/CurrentProgramView',
  '../views/CurrentStateView',
  '../Dashboard',
  'app/tests/Test',
  'app/dashboard/templates/dashboard'
], function(
  t,
  user,
  viewport,
  programs,
  View,
  Model,
  AssignProgramsView,
  TestListView,
  TestCollection,
  CameraView,
  CurrentProgramView,
  CurrentStateView,
  Dashboard,
  Test,
  dashboardTemplate
) {
  'use strict';

  return View.extend({

    template: dashboardTemplate,

    layoutName: 'page',

    pageId: 'dashboard',

    remoteTopics: {
      'tests.started': function(test)
      {
        this.model.set('currentTest', test ? new Test(test) : null);
        this.model.update();
      },
      'tests.finished': function(test)
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
      var actions = [];

      if (user.data.local || user.isAllowedTo('PROGRAMS:MANAGE'))
      {
        actions.push({
          label: t('dashboard', 'assignPrograms:pageAction'),
          href: '#programs;assign',
          callback: this.showAssignProgramsDialog.bind(this)
        });
      }

      return actions;
    },

    initialize: function()
    {
      this.model = new Dashboard();

      this.tests = new TestCollection(null, {
        paginate: false,
        rqlQuery: 'select(startedAt,finishedAt,program.name,result)&sort(-finishedAt)&limit(7)'
      });

      this.currentProgramView = new CurrentProgramView({model: this.model});

      this.currentStateView = new CurrentStateView();

      this.testListView = new TestListView({
        collection: this.tests,
        columns: ['program', 'startedAt', 'duration']
      });

      this.setView('.currentProgram-container', this.currentProgramView);
      this.setView('.currentState-container', this.currentStateView);
      this.setView('.dashboard-tests-container', this.testListView);

      if (user.data.local)
      {
        this.cameraView = new CameraView();

        this.setView('.dashboard-camera-container', this.cameraView);
      }
    },

    serialize: function()
    {
      return {
        local: !!user.data.local
      };
    },

    load: function(when)
    {
      return when(this.model.fetch(), this.tests.fetch({reset: true}));
    },

    showAssignProgramsDialog: function(e)
    {
      viewport.showDialog(new AssignProgramsView(), t('dashboard', 'assignPrograms:dialogTitle'));

      if (e)
      {
        e.preventDefault();
      }
    }

  });
});
