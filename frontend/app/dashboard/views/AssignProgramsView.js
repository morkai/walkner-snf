// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/controller',
  'app/viewport',
  'app/core/View',
  'app/snf-programs/Program',
  'app/snf-programs/ProgramCollection',
  'app/dashboard/templates/assign'
], function(
  _,
  t,
  controller,
  viewport,
  View,
  Program,
  ProgramCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'submit': 'onSubmit'
    },

    afterRender: function()
    {
      this.loadPrograms();
    },

    loadPrograms: function()
    {
      viewport.msg.loading();

      var view = this;
      var $submit = view.$id('submit');
      var programs = new ProgramCollection(null, {
        rqlQuery: 'select(_id,name,kind)&limit(0)'
      });

      var req = programs.fetch();

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });

      req.done(function()
      {
        var kindToPrograms = {
          '30s': [],
          'hrs': [],
          'tester': []
        };

        programs.forEach(function(program)
        {
          kindToPrograms[program.get('kind')].push({
            id: program.id,
            text: program.get('name')
          });
        });

        _.forEach(kindToPrograms, function(programs, kind)
        {
          programs.sort(function(a, b)
          {
            return a.text.localeCompare(b.name, undefined, {numeric: true, ignorePunctuation: true});
          });

          view.$id(kind)
            .removeClass('form-control')
            .prop('disabled', false)
            .val(view.getProgramId(kind))
            .select2({
              allowClear: true,
              placeholder: ' ',
              data: programs
            })
        });

        viewport.msg.loaded();

        $submit.prop('disabled', false);
      });
    },

    onDialogShown: function()
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    },

    onSubmit: function(e)
    {
      e.preventDefault();

      viewport.msg.saving();

      var view = this;
      var $submit = view.$id('submit').attr('disabled', true);
      var completed = 0;
      var error = null;

      view.setProgramTag('30s', view.$id('30s').val(), complete);
      view.setProgramTag('hrs', view.$id('hrs').val(), complete);
      view.setProgramTag('tester', view.$id('tester').val(), complete);

      function complete(err)
      {
        error = error || err;

        ++completed;

        if (completed !== 3)
        {
          return;
        }

        $submit.attr('disabled', false);

        if (error)
        {
          viewport.msg.savingFailed();
        }
        else
        {
          viewport.msg.saved();
        }

        if (!error && _.isFunction(view.closeDialog))
        {
          view.closeDialog();
        }
      }
    },

    getProgramId: function(kind)
    {
      var program = controller.tags.getValue('program.' + kind);

      return program && program._id ? program._id : '';
    },

    setProgramTag: function(kind, newProgramId, done)
    {
      if (newProgramId === this.getProgramId(kind))
      {
        return done();
      }

      if (newProgramId)
      {
        this.assignProgram(kind, newProgramId, done);
      }
      else
      {
        this.unassignProgram(kind, done);
      }
    },

    assignProgram: function(kind, newProgramId, done)
    {
      var program = new Program({_id: newProgramId});
      var req = program.fetch();

      req.fail(function()
      {
        done(new Error('Failed to fetch program.'));
      });

      req.done(function()
      {
        controller.tags.setValue('program.' + kind, program.toJSON(), done);
      })
    },

    unassignProgram: function(kind, done)
    {
      controller.tags.setValue('program.' + kind, null, done);
    }

  });
});
