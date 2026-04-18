import {
  Compass,
  Droplets,
  Eye,
  Gauge,
  MapPinned,
  Thermometer,
  Wind,
} from 'lucide-react';

import type { OneCallWeatherRes } from '@/types';
import type { TempUnit } from '@/lib/weather';
import {
  formatDateTime,
  formatPercent,
  formatPressure,
  formatTemperature,
  formatWind,
} from '@/lib/weather';
import { WeatherCharts } from '@/components/WeatherCharts';
import { WeatherMap } from '@/components/WeatherMap';
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from '@/components/ui/item';

type WeatherDashboardProps = {
  weather: OneCallWeatherRes | null;
  unit: TempUnit;
  locationTitle: string;
  loading?: boolean;
  error?: string | null;
  onUseCurrentLocation: () => void;
};

export const WeatherDashboard = ({
  weather,
  unit,
  locationTitle,
  loading,
  error,
  onUseCurrentLocation,
}: WeatherDashboardProps) => {
  if (loading && !weather) {
    return (
      <section className='grid min-h-[calc(100vh-10rem)] place-items-center rounded-3xl border border-border bg-card/80 px-6 py-16 text-center backdrop-blur-sm'>
        <div className='max-w-md space-y-3'>
          <p className='text-sm uppercase tracking-[0.3em] text-muted-foreground'>
            Loading forecast
          </p>
          <h1 className='text-3xl font-semibold'>Fetching the latest weather data...</h1>
          <p className='text-sm text-muted-foreground'>
            We are pulling the current conditions, hourly forecast, and daily outlook.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className='grid min-h-[calc(100vh-10rem)] place-items-center rounded-3xl border border-border bg-card/80 px-6 py-16 text-center backdrop-blur-sm'>
        <div className='max-w-md space-y-3'>
          <p className='text-sm uppercase tracking-[0.3em] text-muted-foreground'>
            Weather unavailable
          </p>
          <h1 className='text-3xl font-semibold'>{error}</h1>
          <p className='text-sm text-muted-foreground'>
            Try searching another place or use your current location again.
          </p>
          <button
            type='button'
            className='inline-flex h-9 items-center justify-center rounded-none border border-border bg-secondary px-4 text-sm'
            onClick={onUseCurrentLocation}
          >
            Try current location
          </button>
        </div>
      </section>
    );
  }

  if (!weather) {
    return null;
  }

  const current = weather.current;
  const condition = current.weather[0];
  const timezoneLabel = locationTitle || weather.timezone;

  const statRows = [
    {
      key: 'humidity',
      label: 'Humidity',
      value: formatPercent(current.humidity),
      icon: Droplets,
    },
    {
      key: 'wind_speed',
      label: 'Wind',
      value: formatWind(current.wind_speed, unit),
      icon: Wind,
    },
    {
      key: 'pressure',
      label: 'Pressure',
      value: formatPressure(current.pressure),
      icon: Gauge,
    },
    {
      key: 'visibility',
      label: 'Visibility',
      value: `${(current.visibility / 1000).toFixed(1)} km`,
      icon: Eye,
    },
    {
      key: 'uvi',
      label: 'UV index',
      value: current.uvi.toFixed(1),
      icon: Compass,
    },
  ];

  return (
    <div className='space-y-4'>
      <section className='overflow-hidden rounded-3xl border border-border bg-card/90 backdrop-blur-sm'>
        <div className='grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8'>
          <div className='space-y-5'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-full border border-border px-3 py-1 text-xs text-muted-foreground'>
                {timezoneLabel}
              </span>
              <span className='rounded-full border border-border px-3 py-1 text-xs text-muted-foreground'>
                Updated {formatDateTime(current.dt, weather.timezone)}
              </span>
            </div>

            <div className='space-y-2'>
              <p className='text-sm uppercase tracking-[0.35em] text-muted-foreground'>
                Current weather
              </p>
              <h1 className='max-w-xl text-4xl font-semibold leading-tight sm:text-5xl'>
                {condition?.main ?? 'Weather'}
              </h1>
              <p className='max-w-2xl text-sm text-muted-foreground sm:text-base'>
                {condition?.description ?? 'No description available'}
              </p>
            </div>

            <div className='flex flex-wrap items-end gap-4'>
              <div className='flex items-end gap-3'>
                <Thermometer className='mb-1 size-6 text-primary' />
                <div>
                  <div className='text-6xl font-semibold tracking-tight sm:text-7xl'>
                    {formatTemperature(current.temp, unit)}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    Feels like {formatTemperature(current.feels_like, unit)}
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-border bg-muted/40 px-4 py-3'>
                <div className='text-xs uppercase tracking-[0.25em] text-muted-foreground'>
                  Wind gust
                </div>
                <div className='mt-1 text-lg font-medium'>
                  {formatWind(current.wind_gust, unit)}
                </div>
              </div>
            </div>
          </div>

          <div className='grid gap-3 rounded-3xl border border-border bg-background/70 p-4'>
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3'>
              {[
                {
                  label: 'Sunrise',
                  value: formatDateTime(current.sunrise, weather.timezone),
                },
                {
                  label: 'Sunset',
                  value: formatDateTime(current.sunset, weather.timezone),
                },
                {
                  label: 'Cloud cover',
                  value: `${current.clouds}%`,
                },
                {
                  label: 'Dew point',
                  value: formatTemperature(current.dew_point, unit),
                },
                {
                  label: 'Visibility',
                  value: `${(current.visibility / 1000).toFixed(1)} km`,
                },
                {
                  label: 'Location',
                  value: `${weather.lat.toFixed(2)}, ${weather.lon.toFixed(2)}`,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className='rounded-2xl border border-border bg-card/80 px-3 py-3'
                >
                  <div className='text-xs uppercase tracking-[0.2em] text-muted-foreground'>
                    {item.label}
                  </div>
                  <div className='mt-1 text-sm font-medium'>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className='rounded-2xl border border-border bg-card/85 p-4 backdrop-blur-sm'>
        <div className='mb-4 flex items-end justify-between gap-3'>
          <div>
            <h2 className='text-sm font-semibold'>Weather snapshot</h2>
            <p className='text-xs text-muted-foreground'>
              Quick-read metrics for the currently selected place.
            </p>
          </div>
          <MapPinned className='size-4 text-muted-foreground' />
        </div>
        <ItemGroup className='grid gap-3 sm:grid-cols-2 xl:grid-cols-5'>
          {statRows.map((item) => {
            const Icon = item.icon;
            return (
              <Item key={item.key} variant='outline' className='items-start'>
                <Icon className='mt-0.5 size-4 text-primary' />
                <ItemContent>
                  <ItemTitle>{item.label}</ItemTitle>
                  <ItemDescription className='text-sm text-foreground'>
                    {item.value}
                  </ItemDescription>
                </ItemContent>
              </Item>
            );
          })}
        </ItemGroup>
      </section>

      <WeatherCharts weather={weather} unit={unit} />

      <WeatherMap weather={weather} unit={unit} title={String(timezoneLabel)} />
    </div>
  );
};
