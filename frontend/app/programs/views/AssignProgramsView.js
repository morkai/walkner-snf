// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'app/i18n',
  'app/controller',
  'app/viewport',
  'app/data/programs',
  'app/core/View',
  'app/programs/templates/assign'
], function(
  _,
  t,
  controller,
  viewport,
  programs,
  View,
  assignTemplate
) {
  'use strict';

  return View.extend({

    template: assignTemplate,

    events: {
      'submit': 'onSubmit'
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('assignPrograms');
    },

    destroy: function()
    {
      this.$id('30s').select2('destroy');
      this.$id('hrs').select2('destroy');
      this.$id('tester').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        program30s: controller.getValue('program.30s'),
        programHrs: controller.getValue('program.hrs'),
        programTester: controller.getValue('program.tester')
      };
    },

    afterRender: function()
    {
      var programs30s = [];
      var programsHrs = [];
      var programsTester = [];

      programs.forEach(function(program)
      {
        var programList;

        if (program.get('kind') === '30s')
        {
          programList = programs30s;
        }
        else if (program.get('kind') === 'hrs')
        {
          programList = programsHrs;
        }
        else
        {
          programList = programsTester;
        }

        programList.push({
          id: program.id,
          text: program.getLabel()
        });
      });

      this.$id('30s').select2({
        allowClear: true,
        data: programs30s
      });

      this.$id('hrs').select2({
        allowClear: true,
        data: programsHrs
      });

      this.$id('tester').select2({
        allowClear: true,
        data: programsTester
      });
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    onSubmit: function(e)
    {
      e.preventDefault();

      var view = this;
      var $submit = this.$('.btn-primary').attr('disabled', true);
      var programmed30s = false;
      var programmedHrs = false;
      var programmedTester = false;

      this.setProgramTag('30s', this.$id('30s').val(), function()
      {
        programmed30s = true;

        if (programmedHrs && programmedTester)
        {
          done();
        }
      });

      this.setProgramTag('hrs', this.$id('hrs').val(), function()
      {
        programmedHrs = true;

        if (programmed30s && programmedTester)
        {
          done();
        }
      });

      this.setProgramTag('tester', this.$id('tester').val(), function()
      {
        programmedTester = true;

        if (programmed30s && programmedHrs)
        {
          done();
        }
      });

      function done()
      {
        $submit.attr('disabled', false);

        if (_.isFunction(view.closeDialog))
        {
          view.closeDialog();
        }
      }
    },

    setProgramTag: function(kind, newProgramId, done)
    {
      if (newProgramId === controller.getValue('program.' + kind))
      {
        return done();
      }

      var unassign = newProgramId === '';

      controller.setValue('program.' + kind, newProgramId, function(err)
      {
        var msgSuffix = unassign ? ':unassign' : '';

        if (err)
        {
          viewport.msg.show({
            type: 'error',
            time: 5000,
            text: t('programs', 'assignPrograms:failure' + msgSuffix, {
              kind: 'kind' + kind,
              error: err.message
            })
          });
        }
        else
        {
          viewport.msg.show({
            type: 'success',
            time: 2500,
            text: t('programs', 'assignPrograms:success' + msgSuffix, {
              kind: 'kind' + kind,
              program: unassign ? '' : programs.get(newProgramId).getLabel()
            })
          });
        }

        done(err);
      });
    }

  });
});
