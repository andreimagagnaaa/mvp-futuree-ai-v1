declare module 'react-chartjs-2' {
  import { ChartProps } from 'chart.js';
  
  export const Line: React.FC<ChartProps>;
  export const Bar: React.FC<ChartProps>;
  export const Pie: React.FC<ChartProps>;
  export const Doughnut: React.FC<ChartProps>;
} 