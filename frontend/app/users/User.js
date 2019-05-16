// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    defaults: {

    },

    initialize: function()
    {
      if (!Array.isArray(this.get('privileges')))
      {
        this.set('privileges', []);
      }
    },

    getLabel: function()
    {
      var lastName = this.get('lastName') || '';
      var firstName = this.get('firstName') || '';

      return lastName.length && firstName.length ? (lastName + ' ' + firstName) : this.get('login');
    },

    serialize: function()
    {
      return this.toJSON();
    }

  });
});
