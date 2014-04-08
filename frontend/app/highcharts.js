// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'highcharts',
  './i18n',
  './time',
  './broker',
  'highcharts-noData'
], function(
  Highcharts,
  t,
  time,
  broker
) {
  'use strict';

  Highcharts.setOptions({
    global: {
      timezoneOffset: time.getMoment().zone(),
      useUTC: false
    },
    lang: {
      noData: t('core', 'highcharts:noData'),
      resetZoom: t('core', 'highcharts:resetZoom'),
      resetZoomTitle: t('core', 'highcharts:resetZoomTitle'),
      loading: t('core', 'highcharts:loading')
    },
    credits: {
      enabled: false
    }
  });

  setDateLangOptions();

  broker.subscribe('i18n.reloaded', setDateLangOptions);

  function setDateLangOptions()
  {
    Highcharts.setOptions({
      lang: {
        decimalPoint: t('core', 'highcharts:decimalPoint'),
        thousandsSep: t('core', 'highcharts:thousandsSep'),
        shortMonths: t('core', 'highcharts:shortMonths').split('_'),
        weekdays: t('core', 'highcharts:weekdays').split('_'),
        months: t('core', 'highcharts:months').split('_')
      }
    });
  }

  return Highcharts;
});
