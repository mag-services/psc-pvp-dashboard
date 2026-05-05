import Highcharts from 'highcharts';

/** Executive UN dataColours */
const palette = ['#185FA5', '#378ADD', '#5BA3E8', '#0D4A7A', '#88B8E6', '#2C5282', '#A8C8EF', '#1A365D'] as const;

const light: Highcharts.Options = {
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
    style: { fontSize: '13px', fontWeight: '700', color: '#1A1A1A' },
  },
  subtitle: {
    align: 'left',
    style: { fontSize: '11px', color: '#4A5568' },
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
      style: { color: '#4A5568', fontSize: '11px', fontWeight: '600' },
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
        style: { fontWeight: '400', fontSize: '10px', color: '#4A5568' },
      },
    },
  },
};

const dark: Highcharts.Options = {
  chart: {
    backgroundColor: 'transparent',
    style: { fontFamily: 'Arial, Helvetica, sans-serif', color: '#E8EDF4' },
    spacingTop: 12,
    spacingRight: 10,
    spacingBottom: 10,
    spacingLeft: 10,
  },
  title: {
    align: 'left',
    margin: 12,
    style: { fontSize: '13px', fontWeight: '700', color: '#E8EDF4' },
  },
  subtitle: {
    align: 'left',
    style: { fontSize: '11px', color: '#A8B8CC' },
  },
  colors: [...palette],
  credits: { enabled: false },
  legend: {
    enabled: true,
    itemStyle: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '11px',
      color: '#A8B8CC',
      fontWeight: '400',
    },
    itemHoverStyle: { color: '#E8EDF4' },
  },
  xAxis: {
    gridLineWidth: 0,
    lineColor: '#2A3A4F',
    tickColor: '#2A3A4F',
    labels: { style: { color: '#A8B8CC', fontSize: '11px' } },
  },
  yAxis: {
    gridLineWidth: 1,
    gridLineColor: '#2A3A4F',
    lineColor: '#2A3A4F',
    title: {
      style: { color: '#A8B8CC', fontSize: '11px', fontWeight: '600' },
    },
    labels: { style: { color: '#A8B8CC', fontSize: '11px' } },
  },
  tooltip: {
    backgroundColor: '#152232',
    borderWidth: 1,
    borderColor: '#2A3A4F',
    shadow: false,
    style: {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      color: '#E8EDF4',
    },
  },
  plotOptions: {
    series: {
      borderWidth: 0,
      dataLabels: {
        style: { fontWeight: '400', fontSize: '10px', color: '#A8B8CC' },
      },
    },
  },
};

export type ChartThemeMode = 'light' | 'dark';

export function applyChartTheme(mode: ChartThemeMode): void {
  Highcharts.setOptions(mode === 'dark' ? dark : light);
}

/** @deprecated Use applyChartTheme after ThemeProvider mounts */
export function applyHighchartsTheme(): void {
  applyChartTheme('light');
}
