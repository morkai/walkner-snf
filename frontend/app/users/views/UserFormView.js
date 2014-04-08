// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of walkner-snf <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/core/views/FormView',
  'app/data/privileges',
  'app/users/templates/form',
  'i18n!app/nls/users'
], function(
  _,
  t,
  Model,
  FormView,
  privileges,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'userForm',

    events: {
      'submit': 'submitForm',
      'input input[type="password"]': function(e)
      {
        if (this.timers.validatePasswords !== null)
        {
          clearTimeout(this.timers.validatePasswords);
        }

        this.timers.validatePasswords = setTimeout(this.validatePasswords.bind(this, e), 100);
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.options.editMode)
      {
        this.$('input[type="password"]').attr('required', true);
      }
    },

    validatePasswords: function()
    {
      var password1 = this.el.querySelector('#' + this.idPrefix + '-password');
      var password2 = this.el.querySelector('#' + this.idPrefix + '-password2');

      if (password1.value === password2.value)
      {
        password2.setCustomValidity('');
      }
      else
      {
        password2.setCustomValidity(t('users', 'FORM:ERROR:passwordMismatch'));
      }

      this.timers.validatePassword = null;
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        privileges: privileges
      });
    },

    serializeForm: function(formData)
    {
      formData = _.defaults(formData, {
        privileges: []
      });

      return formData;
    }

  });
});
