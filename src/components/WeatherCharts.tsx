import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { OneCallWeatherRes } from '@/types';
import type { TempUnit } from '@/lib/weather';
import { formatDay, formatHour, formatTemperature } from '@/lib/weather';

type WeatherChartsProps = {
  weather: OneCallWeatherRes;
  unit: TempUnit;
};

const formatNumber = new Intl.NumberFormat('en', {
  maximumFractionDigits: 0,
});

export const WeatherCharts = ({ weather, unit }: WeatherChartsProps) => {
  const timezone = weather.timezone;

  const hourlySeries = weather.hourly.slice(0, 24).map((hour) => ({
    label: formatHour(hour.dt, timezone),
    temperature: Math.round(hour.temp),
    feelsLike: Math.round(hour.feels_like),
    precipitation: Math.round(hour.pop * 100),
  }));

  const dailySeries = weather.daily.slice(0, 7).map((day) => ({
    label: formatDay(day.dt, timezone),
    min: Math.round(day.temp.min),
    max: Math.round(day.temp.max),
  }));

  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <section className='rounded-2xl border border-border bg-card/85 p-4 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <div>
            <h3 className='text-sm font-semibold'>Hourly trend</h3>
            <p className='text-xs text-muted-foreground'>
              Temperature and feels-like values for the next 24 hours.
            </p>
          </div>
          <span className='rounded-full border border-border px-3 py-1 text-xs text-muted-foreground'>
            {formatTemperature(weather.current.temp, unit)}
          </span>
        </div>

        <div className='h-[320px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={hourlySeries}>
              <defs>
                <linearGradient id='tempGradient' x1='0' x2='0' y1='0' y2='1'>
                  <stop offset='5%' stopColor='var(--chart-1)' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='var(--chart-1)' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='feelsGradient' x1='0' x2='0' y1='0' y2='1'>
                  <stop offset='5%' stopColor='var(--chart-4)' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='var(--chart-4)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke='var(--border)' strokeDasharray='4 6' />
              <XAxis
                dataKey='label'
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                interval={2}
                stroke='var(--border)'
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                stroke='var(--border)'
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  color: 'var(--popover-foreground)',
                }}
                formatter={(value) =>
                  typeof value === 'number'
                    ? formatTemperature(value, unit)
                    : value
                }
              />
              <Legend />
              <Area
                type='monotone'
                dataKey='temperature'
                name='Temperature'
                stroke='var(--chart-1)'
                fill='url(#tempGradient)'
                strokeWidth={2}
              />
              <Area
                type='monotone'
                dataKey='feelsLike'
                name='Feels like'
                stroke='var(--chart-4)'
                fill='url(#feelsGradient)'
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className='rounded-2xl border border-border bg-card/85 p-4 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.25)] backdrop-blur-sm'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <div>
            <h3 className='text-sm font-semibold'>7-day range</h3>
            <p className='text-xs text-muted-foreground'>
              Daily minimum and maximum temperatures.
            </p>
          </div>
          <span className='rounded-full border border-border px-3 py-1 text-xs text-muted-foreground'>
            {formatNumber.format(weather.daily.length)} days
          </span>
        </div>

        <div className='h-[320px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={dailySeries}>
              <CartesianGrid stroke='var(--border)' strokeDasharray='4 6' />
              <XAxis
                dataKey='label'
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                stroke='var(--border)'
              />
              <YAxis
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                stroke='var(--border)'
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.75rem',
                  color: 'var(--popover-foreground)',
                }}
                formatter={(value) =>
                  typeof value === 'number'
                    ? formatTemperature(value, unit)
                    : value
                }
              />
              <Legend />
              <Bar dataKey='min' name='Minimum' fill='var(--chart-3)' radius={[8, 8, 0, 0]} />
              <Bar dataKey='max' name='Maximum' fill='var(--chart-1)' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
