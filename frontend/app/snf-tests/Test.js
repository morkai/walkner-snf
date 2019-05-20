// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../time',
  '../core/Model',
  '../snf-programs/Program'
], function(
  t,
  time,
  Model,
  Program
) {
  'use strict';

  return Model.extend({

    urlRoot: '/snf/tests',

    clientUrlRoot: '#tests',

    topicPrefix: 'snf.tests',

    privilegePrefix: 'SNF',

    nlsDomain: 'snf-tests',

    initialize: function()
    {
      var program = this.get('program');

      if (program && !(program instanceof Program))
      {
        this.attributes.program = new Program(program);
      }
    },

    getLabel: function()
    {
      return t(this.nlsDomain, 'BREADCRUMBS:details');
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.duration = time.toString((Date.parse(obj.finishedAt) - Date.parse(obj.startedAt)) / 1000);
      obj.startedAt = time.format(obj.startedAt, 'L, HH:mm:ss');
      obj.finishedAt = time.format(obj.finishedAt, 'L, HH:mm:ss');
      obj.orderNo = obj.orderNo || '';
      obj.serialNo = obj.serialNo || '';

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.className = obj.result ? 'success' : 'danger';
      obj.program = obj.program instanceof Program ? obj.program.get('name') : obj.program.name;

      return obj;
    }

  });
});
