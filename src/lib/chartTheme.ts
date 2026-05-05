import Highcharts from 'highcharts';

/** Executive UN dataColors + neutrals */
const palette = ['#185FA5', '#378ADD', '#5BA3E8', '#0D4A7A', '#88B8E6', '#2C5282', '#A8C8EF', '#1A365D'] as const;

export function applyHighchartsTheme(): void {
  Highcharts.setOptions({
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#1A1A1A' },
      spacingTop: 12,
      spacingRight: 10,
      spacingBottom: 10,
      spacingLeft: 10,
    },
    title: {
      align: 'left',
      margin: 12,
      style: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#1A1A1A',
      },
    },
    subtitle: {
      align: 'left',
      style: {
        fontSize: '11px',
        color: '#4A5568',
      },
    },
    colors: [...palette],
    credits: { enabled: false },
    legend: {
      enabled: true,
      itemStyle: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '11px',
        color: '#4A5568',
        fontWeight: '400',
      },
      itemHoverStyle: { color: '#1A1A1A' },
    },
    xAxis: {
      gridLineWidth: 0,
      lineColor: '#E2E8F0',
      tickColor: '#E2E8F0',
      labels: { style: { color: '#4A5568', fontSize: '11px' } },
    },
    yAxis: {
      gridLineWidth: 1,
      gridLineColor: '#E2E8F0',
      lineColor: '#E2E8F0',
      title: {
        style: {
          color: '#4A5568',
          fontSize: '11px',
          fontWeight: '600',
        },
      },
      labels: { style: { color: '#4A5568', fontSize: '11px' } },
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E2E8F0',
      shadow: false,
      style: {
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: '12px',
        color: '#1A1A1A',
      },
    },
    plotOptions: {
      series: {
        borderWidth: 0,
        dataLabels: {
          style: {
            fontWeight: '400',
            fontSize: '10px',
            color: '#4A5568',
          },
        },
      },
    },
  });
}
