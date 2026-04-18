import { useEffect, useState } from 'react';

import { ThemeProvider } from '@/components/ThemeProvider';
import { TopAppBar } from '@/components/TopAppBar';
import { WeatherDashboard } from '@/components/WeatherDashboard';
import { APP, WEATHER_API } from '@/config';
import {
  fetchWeatherByCoords,
  reverseGeocodeLocation,
  type TempUnit,
  type WeatherLocation,
} from '@/lib/weather';
import type { OneCallWeatherRes } from '@/types';

type Coordinates = {
  lat: number;
  lon: number;
};

const readStoredNumber = (key: string, fallback: number) => {
  if (typeof window === 'undefined') return fallback;
  const value = window.localStorage.getItem(key);
  const parsed = value ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const readStoredUnit = (): TempUnit => {
  if (typeof window === 'undefined') return 'metric';
  const value = window.localStorage.getItem(APP.STORE_KEY.UNIT);
  return value === 'imperial' ? 'imperial' : 'metric';
};

const readStoredCoordinates = (): Coordinates => ({
  lat: readStoredNumber(APP.STORE_KEY.LAT, WEATHER_API.DEFAULTS.LAT),
  lon: readStoredNumber(APP.STORE_KEY.LON, WEATHER_API.DEFAULTS.LON),
});

const WeatherApp = () => {
  const [unit, setUnit] = useState<TempUnit>(() => readStoredUnit());
  const [coordinates, setCoordinates] = useState<Coordinates>(() =>
    readStoredCoordinates(),
  );
  const [weather, setWeather] = useState<OneCallWeatherRes | null>(null);
  const [location, setLocation] = useState<WeatherLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(APP.STORE_KEY.UNIT, unit);
  }, [unit]);

  useEffect(() => {
    window.localStorage.setItem(APP.STORE_KEY.LAT, coordinates.lat.toString());
    window.localStorage.setItem(APP.STORE_KEY.LON, coordinates.lon.toString());
  }, [coordinates]);

  useEffect(() => {
    let active = true;

    const loadWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        const nextWeather = await fetchWeatherByCoords(
          coordinates.lat,
          coordinates.lon,
          unit,
        );

        if (!active) return;

        setWeather(nextWeather);
      } catch (requestError) {
        if (!active) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Unable to load the weather forecast.',
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadWeather();

    return () => {
      active = false;
    };
  }, [coordinates, unit]);

  const handleSelectLocation = (nextLocation: WeatherLocation) => {
    setLocation(nextLocation);
    setCoordinates({
      lat: nextLocation.lat,
      lon: nextLocation.lon,
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not available in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const nextCoordinates = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setCoordinates(nextCoordinates);
        setError(null);

        try {
          const reverseLocation = await reverseGeocodeLocation(
            nextCoordinates.lat,
            nextCoordinates.lon,
          );
          if (reverseLocation) {
            setLocation(reverseLocation);
          }
        } catch {
          setLocation(null);
        }
      },
      () => {
        setError('Location permission was denied or unavailable.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    );
  };

  const locationTitle =
    location?.label ??
    weather?.timezone ??
    `Lat ${coordinates.lat.toFixed(2)}, Lon ${coordinates.lon.toFixed(2)}`;

  return (
    <ThemeProvider>
      <div className='min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_25%),linear-gradient(180deg,_var(--background),_color-mix(in_oklab,_var(--background)_90%,_var(--muted)))] text-foreground'>
        <TopAppBar
          unit={unit}
          onToggleUnit={() =>
            setUnit((currentUnit) =>
              currentUnit === 'metric' ? 'imperial' : 'metric',
            )
          }
          onSelectLocation={handleSelectLocation}
          onOpenCurrentLocation={handleCurrentLocation}
        />

        <main className='container pb-10 pt-6 lg:pt-8'>
          <WeatherDashboard
            weather={weather}
            unit={unit}
            locationTitle={String(locationTitle)}
            loading={loading}
            error={error}
            onUseCurrentLocation={handleCurrentLocation}
          />
        </main>
      </div>
    </ThemeProvider>
  );
};

export const App = () => <WeatherApp />;
