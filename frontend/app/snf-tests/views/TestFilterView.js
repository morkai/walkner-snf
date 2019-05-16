// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/util/forms/dateTimeRange',
  'app/core/views/FilterView',
  'app/snf-tests/templates/filter'
], function(
  _,
  dateTimeRange,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        result: [true, false]
      };
    },

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'result': function(propertyName, term, formData)
      {
        formData.result = [term.args[1].toString()];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('result');
    },

    serializeFormToQuery: function(selector)
    {
      var result = this.getButtonGroupValue('result');

      dateTimeRange.formToRql(this, selector);

      if (result.length === 1)
      {
        selector.push({name: 'eq', args: ['result', result[0] === 'true']});
      }
    }

  });
});
