import axios from 'axios';

import { openWeatherApi } from '@/api';
import { WEATHER_API } from '@/config';
import type {
  CurrentWeather,
  DailyForecast,
  Geocoding,
  HourlyForecast,
  OneCallWeatherRes,
  WeatherCondition,
} from '@/types';

export type TempUnit = 'metric' | 'imperial';

export type WeatherLocation = Geocoding & {
  label: string;
};

type CurrentApiResponse = {
  coord: { lon: number; lat: number };
  weather: WeatherCondition[];
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  timezone: number;
  name: string;
};

type ForecastItem = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    pressure: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  weather: WeatherCondition[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    '3h': number;
  };
  snow?: {
    '3h': number;
  };
};

type ForecastApiResponse = {
  city: {
    coord: { lat: number; lon: number };
    country: string;
    timezone: number;
    sunrise: number;
    sunset: number;
    name: string;
  };
  list: ForecastItem[];
};

const getLocationLabel = (location: Geocoding) => {
  const parts = [location.name, location.state, location.country].filter(Boolean);
  return parts.join(', ');
};

export const formatLocation = (location: Geocoding) => ({
  ...location,
  label: getLocationLabel(location),
});

export const searchLocations = async (query: string) => {
  const response = await openWeatherApi.get('/geo/1.0/direct', {
    params: {
      q: query,
      limit: WEATHER_API.DEFAULTS.SEARCH_RESULT_LIMIT,
    },
  });

  return (response.data as Geocoding[]).map(formatLocation);
};

export const reverseGeocodeLocation = async (lat: number, lon: number) => {
  const response = await openWeatherApi.get('/geo/1.0/reverse', {
    params: {
      lat,
      lon,
      limit: 1,
    },
  });

  const [location] = response.data as Geocoding[];
  return location ? formatLocation(location) : null;
};

const buildCurrentWeather = (response: CurrentApiResponse): CurrentWeather => ({
  dt: response.dt,
  sunrise: response.sys.sunrise,
  sunset: response.sys.sunset,
  temp: response.main.temp,
  feels_like: response.main.feels_like,
  pressure: response.main.pressure,
  humidity: response.main.humidity,
  dew_point: response.main.temp - 2,
  uvi: 0,
  clouds: response.clouds.all,
  visibility: response.visibility,
  wind_speed: response.wind.speed,
  wind_deg: response.wind.deg,
  wind_gust: response.wind.gust ?? response.wind.speed,
  weather: [response.weather[0] as WeatherCondition],
});

const getTimezoneLabel = (offsetSeconds: number) => {
  const hours = offsetSeconds / 3600;
  if (hours === 0) return 'UTC';
  const sign = hours > 0 ? '+' : '-';
  return `UTC${sign}${Math.abs(hours)}`;
};

const parseUtcLabel = (timeZone: string) => {
  const match = /^UTC([+-])(\d+(?:\.\d+)?)$/.exec(timeZone);
  if (!match) return null;

  const [, sign, hours] = match;
  const offsetSeconds = Number(hours) * 3600;
  return sign === '+' ? offsetSeconds : -offsetSeconds;
};

const toLocalDateKey = (timestamp: number, offsetSeconds: number) => {
  const local = new Date((timestamp + offsetSeconds) * 1000);
  return `${local.getUTCFullYear()}-${local.getUTCMonth()}-${local.getUTCDate()}`;
};

const buildDailyForecasts = (
  items: ForecastItem[],
  offsetSeconds: number,
  sunrise: number,
  sunset: number,
): DailyForecast[] => {
  const grouped = new Map<string, ForecastItem[]>();

  for (const item of items) {
    const key = toLocalDateKey(item.dt, offsetSeconds);
    const group = grouped.get(key);
    if (group) {
      group.push(item);
    } else {
      grouped.set(key, [item]);
    }
  }

  return Array.from(grouped.values()).slice(0, 7).map((group, index) => {
    const temps = group.map((item) => item.main.temp);
    const feels = group.map((item) => item.main.feels_like);
    const pressures = group.map((item) => item.main.pressure);
    const humidities = group.map((item) => item.main.humidity);
    const winds = group.map((item) => item.wind.speed);
    const gusts = group.map((item) => item.wind.gust ?? item.wind.speed);
    const representative = group[Math.floor(group.length / 2)] ?? group[0];

    return {
      dt: representative.dt,
      sunrise: index === 0 ? sunrise : representative.dt - 6 * 60 * 60,
      sunset: index === 0 ? sunset : representative.dt + 6 * 60 * 60,
      moonrise: representative.dt - 2 * 60 * 60,
      moonset: representative.dt + 2 * 60 * 60,
      moon_phase: 0.5,
      summary: representative.weather[0]?.description ?? '',
      temp: {
        day: representative.main.temp,
        min: Math.min(...temps),
        max: Math.max(...temps),
        night: temps[temps.length - 1] ?? representative.main.temp,
        eve: temps[Math.max(0, Math.floor(temps.length / 2))] ?? representative.main.temp,
        morn: temps[0] ?? representative.main.temp,
      },
      feels_like: {
        day: representative.main.feels_like,
        night: feels[feels.length - 1] ?? representative.main.feels_like,
        eve: feels[Math.max(0, Math.floor(feels.length / 2))] ?? representative.main.feels_like,
        morn: feels[0] ?? representative.main.feels_like,
      },
      pressure: Math.round(
        pressures.reduce((sum, value) => sum + value, 0) / pressures.length,
      ),
      humidity: Math.round(
        humidities.reduce((sum, value) => sum + value, 0) / humidities.length,
      ),
      dew_point: representative.main.feels_like - 1.5,
      wind_speed: Math.max(...winds),
      wind_deg: representative.wind.deg,
      wind_gust: Math.max(...gusts),
      weather: [representative.weather[0] as WeatherCondition],
    };
  });
};

const buildHourlyForecasts = (items: ForecastItem[]): HourlyForecast[] =>
  items.slice(0, 40).map((item) => ({
    dt: item.dt,
    temp: item.main.temp,
    feels_like: item.main.feels_like,
    pressure: item.main.pressure,
    humidity: item.main.humidity,
    dew_point: item.main.feels_like - 1.5,
    uvi: 0,
    clouds: item.clouds.all,
    visibility: item.visibility,
    wind_speed: item.wind.speed,
    wind_deg: item.wind.deg,
    wind_gust: item.wind.gust ?? item.wind.speed,
    weather: [item.weather[0] as WeatherCondition],
    pop: item.pop,
    rain: item.rain ? { '1h': item.rain['3h'] } : undefined,
    snow: item.snow ? { '1h': item.snow['3h'] } : undefined,
  }));

const buildFreeTierWeather = async (
  lat: number,
  lon: number,
  unit: TempUnit,
) => {
  const [currentResponse, forecastResponse] = await Promise.all([
    openWeatherApi.get<CurrentApiResponse>('/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: unit,
        lang: WEATHER_API.DEFAULTS.LANG,
      },
    }),
    openWeatherApi.get<ForecastApiResponse>('/data/2.5/forecast', {
      params: {
        lat,
        lon,
        units: unit,
        lang: WEATHER_API.DEFAULTS.LANG,
      },
    }),
  ]);

  const current = buildCurrentWeather(currentResponse.data);
  const timezoneOffset = forecastResponse.data.city.timezone;
  const hourly = buildHourlyForecasts(forecastResponse.data.list);
  const daily = buildDailyForecasts(
    forecastResponse.data.list,
    timezoneOffset,
    forecastResponse.data.city.sunrise,
    forecastResponse.data.city.sunset,
  );

  return {
    lat: currentResponse.data.coord.lat,
    lon: currentResponse.data.coord.lon,
    timezone: getTimezoneLabel(timezoneOffset),
    timezone_offset: timezoneOffset,
    current,
    minutely: [],
    hourly,
    daily,
  } satisfies OneCallWeatherRes;
};

export const fetchWeatherByCoords = async (
  lat: number,
  lon: number,
  unit: TempUnit,
) => {
  try {
    const response = await openWeatherApi.get<OneCallWeatherRes>(
      '/data/3.0/onecall',
      {
        params: {
          lat,
          lon,
          units: unit,
          lang: WEATHER_API.DEFAULTS.LANG,
          exclude: 'minutely',
        },
      },
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      return buildFreeTierWeather(lat, lon, unit);
    }

    throw error;
  }
};

export const convertTemperature = (
  value: number,
  from: TempUnit,
  to: TempUnit,
) => {
  if (from === to) return value;
  return from === 'metric'
    ? value * (9 / 5) + 32
    : (value - 32) * (5 / 9);
};

export const temperatureLabel = (unit: TempUnit) =>
  unit === 'metric' ? '°C' : '°F';

export const windLabel = (unit: TempUnit) =>
  unit === 'metric' ? 'm/s' : 'mph';

export const formatTemperature = (value: number, unit: TempUnit) =>
  `${Math.round(value)}${temperatureLabel(unit)}`;

export const formatPercent = (value: number) => `${Math.round(value)}%`;

export const formatWind = (value: number, unit: TempUnit) =>
  `${value.toFixed(unit === 'metric' ? 1 : 0)} ${windLabel(unit)}`;

export const formatPressure = (value: number) => `${Math.round(value)} hPa`;

const getDateFromTimestamp = (value: number, timeZone?: string | number) => {
  if (typeof timeZone === 'number') {
    return new Date((value + timeZone) * 1000);
  }

  const offsetSeconds = timeZone ? parseUtcLabel(timeZone) : null;
  return new Date((value + (offsetSeconds ?? 0)) * 1000);
};

const getIntlTimeZone = (timeZone?: string | number) => {
  if (typeof timeZone === 'string' && !timeZone.startsWith('UTC')) {
    return timeZone;
  }

  return 'UTC';
};

export const formatDateTime = (value: number, timeZone?: string | number) =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: getIntlTimeZone(timeZone),
  }).format(getDateFromTimestamp(value, timeZone));

export const formatDay = (value: number, timeZone?: string | number) =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    timeZone: getIntlTimeZone(timeZone),
  }).format(getDateFromTimestamp(value, timeZone));

export const formatHour = (value: number, timeZone?: string | number) =>
  new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    hour12: true,
    timeZone: getIntlTimeZone(timeZone),
  }).format(getDateFromTimestamp(value, timeZone));
