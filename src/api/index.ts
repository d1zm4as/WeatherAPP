//node modules

import axios from 'axios';

export const openWeatherApi = axios.create({
  baseURL: 'https://api.openweathermap.org',
  params: {
    appid: import.meta.env.VITE_OPEN_WEATHER_API,
  },
});
