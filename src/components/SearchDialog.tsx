// Custon modules
import { APP, WEATHER_API } from '@/config';
import { openWeatherApi } from '@/api';

//Hooks

import { useEffect, useCallback, useState } from 'react';

// Components

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';

import { Kbd, KbdGroup } from '@/components/ui/kbd';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
} from '@/components/ui/item';

//Assets

import { MapPinnedIcon, SearchIcon } from 'lucide-react';

// Types

import type { Geocoding } from '@/types';

export const SearchDialog = () => {
  return <div>SearchDialog</div>;
};
