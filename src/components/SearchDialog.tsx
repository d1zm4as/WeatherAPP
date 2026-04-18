import { useEffect, useMemo, useRef, useState } from 'react';

import { SearchIcon, MapPinnedIcon, LoaderCircle } from 'lucide-react';

import { searchLocations } from '@/lib/weather';
import type { WeatherLocation } from '@/lib/weather';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Item, ItemContent, ItemDescription, ItemTitle } from '@/components/ui/item';
import { Kbd, KbdGroup } from '@/components/ui/kbd';

type SearchDialogProps = {
  onSelectLocation: (location: WeatherLocation) => void;
  onOpenCurrentLocation?: () => void;
};

export const SearchDialog = ({
  onSelectLocation,
  onOpenCurrentLocation,
}: SearchDialogProps) => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<WeatherLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shortcutLabel = useMemo(
    () => (navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl K'),
    [],
  );

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && event.key === 'k';
      if (!isShortcut) return;

      event.preventDefault();
      setOpen(true);
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [open]);

  useEffect(() => {
    let active = true;

    if (search.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeout = window.setTimeout(async () => {
      if (!active) return;
      setLoading(true);
      try {
        const nextResults = await searchLocations(search.trim());
        if (active) {
          setResults(nextResults);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [search]);

  const handleSelect = (location: WeatherLocation) => {
    onSelectLocation(location);
    setOpen(false);
    setSearch('');
    setResults([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          className='me-auto h-9 min-w-0 gap-2 bg-secondary/70 px-3 text-left dark:bg-secondary/40 lg:w-[24rem]'
          aria-label='Search weather location'
        >
          <SearchIcon className='size-4 text-muted-foreground' />
          <span className='hidden flex-1 items-center justify-between gap-3 lg:flex'>
            <span className='text-muted-foreground'>Search weather...</span>
            <KbdGroup>
              <Kbd>{shortcutLabel}</Kbd>
            </KbdGroup>
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[34rem]'>
        <DialogHeader>
          <DialogTitle>Search weather</DialogTitle>
          <DialogDescription>
            Type a city or place. Keyboard shortcut: {shortcutLabel}.
          </DialogDescription>
        </DialogHeader>

        <InputGroup className='bg-background/80'>
          <InputGroupAddon align='inline-start'>
            <SearchIcon className='size-4' />
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            value={search}
            placeholder='Try "London", "Tokyo", or "Austin"'
            onChange={(event) => setSearch(event.target.value)}
          />
          {loading && (
            <InputGroupAddon align='inline-end'>
              <LoaderCircle className='size-4 animate-spin' />
            </InputGroupAddon>
          )}
        </InputGroup>

        {onOpenCurrentLocation && (
          <Button
            type='button'
            variant='secondary'
            className='justify-start gap-2'
            onClick={() => {
              onOpenCurrentLocation();
              setOpen(false);
            }}
          >
            <MapPinnedIcon className='size-4' />
            Use my current location
          </Button>
        )}

        <div className='max-h-[20rem] overflow-auto pr-1'>
          {results.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              {search.trim().length < 2
                ? 'Start typing to search across weather locations.'
                : 'No results yet. Try a nearby city or region.'}
            </p>
          ) : (
            <div className='flex flex-col gap-2'>
              {results.map((location) => (
                <button
                  key={`${location.name}-${location.lat}-${location.lon}`}
                  type='button'
                  className='text-left'
                  onClick={() => handleSelect(location)}
                >
                  <Item variant='outline' className='hover:bg-muted/60'>
                    <ItemContent>
                      <ItemTitle>
                        {location.name}
                        <span className='text-muted-foreground'>·</span>
                        <span className='font-normal text-muted-foreground'>
                          {location.country}
                        </span>
                      </ItemTitle>
                      <ItemDescription>
                        {location.state ? `${location.state} · ` : ''}
                        {location.label}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
