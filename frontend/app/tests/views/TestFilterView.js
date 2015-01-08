// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/core/util/fixTimeRange',
  'app/core/views/FilterView',
  'app/data/programs',
  'app/tests/templates/filter'
], function(
  fixTimeRange,
  FilterView,
  programs,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        from: '',
        to: '',
        program: '',
        result: [true, false]
      };
    },

    termToForm: {
      'startedAt': function(propertyName, term, formData)
      {
        fixTimeRange.toFormData(formData, term, 'date+time');
      },
      'result': function(propertyName, term, formData)
      {
        formData.result = [term.args[1].toString()];
      },
      'program._id': function(propertyName, term, formData)
      {
        formData.program = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('result');

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

    serializeFormToQuery: function(selector)
    {
      var timeRange = fixTimeRange.fromView(this);
      var program = this.$id('program').val();
      var result = this.getButtonGroupValue('result');

      if (program !== '')
      {
        selector.push({name: 'eq', args: ['program._id', program]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['startedAt', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['startedAt', timeRange.to]});
      }

      if (result.length === 1)
      {
        selector.push({name: 'eq', args: ['result', result[0] === 'true']});
      }
    }

  });
});
