// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'moment',
  'js2form',
  'reltime',
  'app/i18n',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/data/programs',
  'app/tests/templates/filter',
  'select2'
], function(
  _,
  moment,
  js2form,
  reltime,
  t,
  View,
  fixTimeRange,
  programs,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('testFilter');
    },

    destroy: function()
    {
      this.$id('program').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.toggleResult(formData.result);

      this.$id('program').select2({
        width: '250px',
        allowClear: true,
        data: programs.map(function(program)
        {
          return {
            id: program.id,
            text: program.getLabel()
          };
        })
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        from: '',
        to: '',
        program: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit),
        result: null
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'startedAt':
            formData[term.name === 'ge' ? 'from' : 'to'] =
              moment(term.args[1]).format('YYYY-MM-DD HH:mm:ss');
            break;

          case 'program':
            formData.program = term.args[1];
            break;

          case 'result':
            formData.result = !!term.args[1];
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange(this.$id('from'), this.$id('to'), 'YYYY-MM-DD HH:mm:ss');
      var selector = [];
      var program = this.$id('program').val().trim();
      var result = this.fixResult();

      if (program !== '')
      {
        selector.push({name: 'eq', args: ['program', program]});
      }

      if (timeRange.from !== -1)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to !== -1)
      {
        selector.push({name: 'le', args: ['startedAt', timeRange.to]});
      }

      if (typeof result === 'boolean')
      {
        selector.push({name: 'eq', args: ['result', result]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10);
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    fixResult: function()
    {
      var $results = this.$('.tests-filter-form-result');
      var $activeResults = $results.filter('.active');

      if ($activeResults.length === 1)
      {
        return $activeResults.val() === 'true';
      }

      $results.addClass('active');

      return null;
    },

    toggleResult: function(result)
    {
      var $results = this.$('.tests-filter-form-result');

      if (result === null)
      {
        $results.addClass('active');
      }
      else
      {
        $results.filter('[value="' + result + '"]').addClass('active');
      }
    }

  });
});
