define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/data/programs',
  'app/core/View',
  'app/programs/views/AssignProgramsView',
  '../views/DashboardView'
], function(
  t,
  user,
  viewport,
  programs,
  View,
  AssignProgramsView,
  DashboardView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'dashboard',

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
      this.view = new DashboardView();
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
