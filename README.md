# WeatherAPP

A responsive weather dashboard built with React, TypeScript, Vite, and Tailwind CSS.

## Overview

The app lets users:

- view weather forecasts for a selected location
- use geolocation to fetch the current position
- switch between metric and imperial units
- keep the last selected location in localStorage
- handle loading and error states cleanly

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Mapbox GL
- Axios
- Recharts
- Radix UI patterns

## Main Features

- location search and selection
- geolocation support
- persisted unit preference
- persisted coordinates
- forecast dashboard with weather cards
- clean loading and error handling
- responsive layout for desktop and mobile

## What makes this project useful for portfolio

This project shows more than just UI work. It includes:

- async data fetching
- browser storage
- geolocation APIs
- component composition
- state management with hooks
- a polished dashboard-style interface

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Suggested improvements

- add saved favorite locations
- add hourly and daily forecast tabs
- add weather alerts
- add forecast comparison between cities
- add charts for temperature and precipitation
- add a more detailed loading skeleton state

## Notes

- The app stores user preferences in `localStorage`.
- Coordinates are restored on reload so the experience feels persistent.
- Weather data is fetched from the selected location rather than relying only on manual input.
