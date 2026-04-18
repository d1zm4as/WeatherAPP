import { useEffect, useRef } from 'react';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import type { OneCallWeatherRes } from '@/types';
import type { TempUnit } from '@/lib/weather';
import { formatTemperature, formatWind } from '@/lib/weather';

type WeatherMapProps = {
  weather: OneCallWeatherRes;
  unit: TempUnit;
  title: string;
};

const escapeHtml = (value: string | number) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const WeatherMap = ({ weather, unit, title }: WeatherMapProps) => {
  const { theme } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const token = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  useEffect(() => {
    if (!mapContainerRef.current || !token) return;

    mapboxgl.accessToken = token;

    const style =
      theme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/streets-v12';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style,
      center: [weather.lon, weather.lat],
      zoom: 9.5,
      pitch: 30,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    const popup = new mapboxgl.Popup({ offset: 24 }).setHTML(`
      <div style="min-width: 180px; font-family: Inter, sans-serif;">
        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">${escapeHtml(title)}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 8px;">${escapeHtml(weather.current.weather[0]?.description ?? 'Weather update')}</div>
        <div style="display: grid; gap: 4px; font-size: 12px;">
          <div>Temp: ${formatTemperature(weather.current.temp, unit)}</div>
          <div>Wind: ${formatWind(weather.current.wind_speed, unit)}</div>
          <div>Humidity: ${Math.round(weather.current.humidity)}%</div>
        </div>
      </div>
    `);

    const marker = new mapboxgl.Marker({
      color: '#f97316',
    })
      .setLngLat([weather.lon, weather.lat])
      .setPopup(popup)
      .addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [
    theme,
    token,
    title,
    unit,
    weather,
    weather.current.humidity,
    weather.current.temp,
    weather.current.wind_speed,
    weather.lat,
    weather.lon,
    weather.current.weather,
  ]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [weather.lon, weather.lat],
      zoom: 9.5,
      essential: true,
    });
    markerRef.current?.setLngLat([weather.lon, weather.lat]);
  }, [weather.lat, weather.lon]);

  if (!token) {
    return (
      <section className='rounded-2xl border border-border bg-card/85 p-4 backdrop-blur-sm'>
        <div className='mb-3 flex items-start justify-between gap-4'>
          <div>
            <h3 className='text-sm font-semibold'>Interactive map</h3>
            <p className='text-xs text-muted-foreground'>
              Add `VITE_MAPBOX_TOKEN` to your environment to enable the Mapbox view.
            </p>
          </div>
        </div>
        <div className='grid min-h-[280px] place-items-center rounded-xl border border-dashed border-border bg-muted/30 text-center text-sm text-muted-foreground'>
          Mapbox token is missing.
        </div>
      </section>
    );
  }

  return (
    <section className='rounded-2xl border border-border bg-card/85 p-4 backdrop-blur-sm'>
      <div className='mb-3 flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-sm font-semibold'>Interactive map</h3>
          <p className='text-xs text-muted-foreground'>
            Mapbox keeps the location interactive while the marker follows the selected city.
          </p>
        </div>
        <Button type='button' variant='secondary' size='sm'>
          {title}
        </Button>
      </div>
      <div
        ref={mapContainerRef}
        className='min-h-[320px] overflow-hidden rounded-xl border border-border'
      />
    </section>
  );
};
