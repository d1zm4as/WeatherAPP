type WeatherConditionCode =
  | 200
  | 201
  | 202
  | 210
  | 211
  | 212
  | 221
  | 230
  | 231
  | 232
  | 300
  | 301
  | 302
  | 310
  | 311
  | 312
  | 313
  | 314
  | 321
  | 500
  | 501
  | 502
  | 503
  | 504
  | 511
  | 520
  | 521
  | 522
  | 531
  | 600
  | 601
  | 602
  | 611
  | 612
  | 613
  | 615
  | 616
  | 620
  | 621
  | 622
  | 701
  | 711
  | 721
  | 731
  | 741
  | 751
  | 761
  | 762
  | 771
  | 781
  | 800
  | 801
  | 802
  | 803
  | 804;

type WeatherConditionMain =
  | "Thunderstorm"
  | "Drizzle"
  | "Rain"
  | "Snow"
  | "Mist"
  | "Smoke"
  | "Haze"
  | "Dust"
  | "Fog"
  | "Sand"
  | "Ash"
  | "Squall"
  | "Tornado"
  | "Clear"
  | "Clouds";

type WeatherConditionDescription =
  | "thunderstorm with light rain"
  | "thunderstorm with rain"
  | "thunderstorm with heavy rain"
  | "light thunderstorm"
  | "thunderstorm"
  | "heavy thunderstorm"
  | "ragged thunderstorm"
  | "thunderstorm with light drizzle"
  | "thunderstorm with drizzle"
  | "thunderstorm with heavy drizzle"
  | "light intensity drizzle"
  | "drizzle"
  | "heavy intensity drizzle"
  | "light intensity drizzle rain"
  | "drizzle rain"
  | "heavy intensity drizzle rain"
  | "shower rain and drizzle"
  | "heavy shower rain and drizzle"
  | "shower drizzle"
  | "light rain"
  | "moderate rain"
  | "heavy intensity rain"
  | "very heavy rain"
  | "extreme rain"
  | "freezing rain"
  | "light intensity shower rain"
  | "shower rain"
  | "heavy intensity shower rain"
  | "ragged shower rain"
  | "light snow"
  | "snow"
  | "heavy snow"
  | "sleet"
  | "light shower sleet"
  | "shower sleet"
  | "light rain and snow"
  | "rain and snow"
  | "light shower snow"
  | "shower snow"
  | "heavy shower snow"
  | "mist"
  | "smoke"
  | "haze"
  | "sand/dust whirls"
  | "fog"
  | "sand"
  | "dust"
  | "volcanic ash"
  | "squalls"
  | "tornado"
  | "clear sky"
  | "few clouds: 11-25%"
  | "scattered clouds: 25-50%"
  | "broken clouds: 51-84%"
  | "overcast clouds: 85-100%";

type WeatherConditionIcon =
  | "01d"
  | "02d"
  | "03d"
  | "04d"
  | "09d"
  | "10d"
  | "11d"
  | "13d"
  | "50d"
  | "01n"
  | "02n"
  | "03n"
  | "04n"
  | "09n"
  | "10n"
  | "11n"
  | "13n"
  | "50n";

export interface WeatherCondition {
  id: WeatherConditionCode;
  main: WeatherConditionMain;
  description: WeatherConditionDescription;
  icon: WeatherConditionIcon;
}

export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: [WeatherCondition];
}

export interface MinutelyForecast {
  dt: number;
  precipitation: number;
}

export interface HourlyForecast extends Omit<
  CurrentWeather,
  "sunrise" | "sunset"
> {
  pop: number;
  rain?: {
    "1h": number;
  };
  snow?: {
    "1h": number;
  };
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust: number;
  weather: [WeatherCondition];
}

export interface Alert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface OneCallWeatherRes {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeather;
  minutely: MinutelyForecast[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts?: Alert[];
}

export type WeatherTimezone = {
  timezone: string;
  offset: number;
};

export interface Geocoding {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}
