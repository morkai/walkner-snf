// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/users/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      lastName: ''
    },

    termToForm: {
      'lastName': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      }
    },

    serializeFormToQuery: function(selector)
    {
      var lastName = this.$id('lastName').val().trim();

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }
    }

  });
});
