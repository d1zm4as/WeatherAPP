import { Logo } from '@/assets/Logo';
import { SearchDialog } from '@/components/SearchDialog';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import type { WeatherLocation } from '@/lib/weather';
import type { TempUnit } from '@/lib/weather';

type TopAppBarProps = {
  unit: TempUnit;
  onToggleUnit: () => void;
  onSelectLocation: (location: WeatherLocation) => void;
  onOpenCurrentLocation: () => void;
};

export const TopAppBar = ({
  unit,
  onToggleUnit,
  onSelectLocation,
  onOpenCurrentLocation,
}: TopAppBarProps) => {
  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl'>
      <div className='container flex h-16 items-center gap-3'>
        <div className='flex items-center gap-3'>
          <Logo variant='icon' size={34} />
          <div className='hidden sm:block'>
            <p className='text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground'>
              Weather
            </p>
            <p className='text-sm font-medium'>Cloudcast</p>
          </div>
        </div>

        <SearchDialog
          onSelectLocation={onSelectLocation}
          onOpenCurrentLocation={onOpenCurrentLocation}
        />

        <div className='ml-auto flex items-center gap-2'>
          <Button
            type='button'
            variant='secondary'
            size='sm'
            className='hidden sm:inline-flex'
            onClick={onToggleUnit}
          >
            {unit === 'metric' ? '°C' : '°F'}
          </Button>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            className='sm:hidden'
            onClick={onToggleUnit}
            aria-label='Toggle temperature unit'
          >
            {unit === 'metric' ? 'C' : 'F'}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
