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
  //states
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<Geocoding[]>([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState<boolean>(false);
  // search request

  const geocoding = useCallback(async (search: string) => {
    if (!search) return;
    const response = await openWeatherApi.get('/geo/1.0/direct', {
      params: {
        q: search,
        limit: WEATHER_API.DEFAULTS.SEARCH_RESULT_LIMIT,
      },
    });
    return response.data as Geocoding[];
  }, []);

  return <div>SearchDialog</div>;
};
