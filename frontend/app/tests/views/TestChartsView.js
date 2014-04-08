// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'app/i18n',
  'app/time',
  'app/highcharts',
  'app/core/View'
], function(
  t,
  time,
  Highcharts,
  View
) {
  'use strict';

  return View.extend({

    initialize: function()
    {
      this.chart = null;
    },

    destroy: function()
    {
      if (this.chart !== null)
      {
        this.chart.destroy();
        this.chart = null;
      }
    },

    afterRender: function()
    {
      if (this.chart)
      {
        this.updateChart();
      }
      else
      {
        this.createChart();
      }
    },

    createChart: function()
    {
      var chartData = this.model.get('tags');
      var pointStart = new Date(this.model.get('startedAt'));

      pointStart.setMilliseconds(0);

      var pointStartTime = pointStart.getTime();

      this.chart = new Highcharts.Chart({
        chart: {
          renderTo: this.el,
          zoomType: 'x',
          height: 350
        },
        title: false,
        noData: {},
        xAxis: {
          type: 'linear'
        },
        yAxis: [
          {
            title: {
              text: t('tests', 'charts:current')
            }
          },
          {
            title: {
              text: t('tests', 'charts:voltage')
            }
          },
          {
            title: {
              text: t('tests', 'charts:temperature')
            },
            opposite: true
          },
          {
            title: {
              text: t('tests', 'charts:light')
            },
            opposite: true
          }
        ],
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function()
          {
            var str = '<b>' + time.toString(this.x, true) + '</b><table>';

            $.each(this.points, function(i, point)
            {
              str += '<tr><td style="color: ' + point.series.color + '">'
                + point.series.name + ':</td><td>'
                + point.y + (point.series.tooltipOptions.valueSuffix || '')
                + '</td></tr>';
            });

            str += '</table>';

            return str;
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          verticalAlign: 'bottom'
        },
        plotOptions: {
          line: {
            lineWidth: 1.5,
            pointInterval: 1,
            pointStart: 0,
            marker: {
              radius: 0,
              symbol: 'circle',
              lineWidth: 0,
              states: {
                hover: {
                  radius: 4
                }
              }
            }
          }
        },
        series: [
          {
            name: t('tests', 'charts:current'),
            type: 'line',
            yAxis: 0,
            data: chartData.current,
            tooltip: {
              valueSuffix: t('tests', 'charts:current:suffix')
            }
          },
          {
            name: t('tests', 'charts:voltage'),
            type: 'line',
            yAxis: 1,
            data: chartData.voltage,
            tooltip: {
              valueSuffix: t('tests', 'charts:voltage:suffix')
            }
          },
          {
            name: t('tests', 'charts:temperature'),
            type: 'line',
            yAxis: 2,
            data: chartData.temperature,
            tooltip: {
              valueSuffix: t('tests', 'charts:temperature:suffix')
            }
          },
          {
            name: t('tests', 'charts:light1'),
            type: 'line',
            yAxis: 3,
            data: chartData.light1
          },
          {
            name: t('tests', 'charts:light2'),
            type: 'line',
            yAxis: 3,
            data: chartData.light2
          }
        ]
      });
    },

    updateChart: function()
    {
      var chartData = this.model.get('tags');

      this.chart.series[0].setData(chartData.current, false);
      this.chart.series[1].setData(chartData.voltage, false);
      this.chart.series[2].setData(chartData.temperature, false);
      this.chart.series[3].setData(chartData.light1, false);
      this.chart.series[4].setData(chartData.light2, true);
    }

  });
});
