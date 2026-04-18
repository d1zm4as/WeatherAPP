import { MoonStars, Sun, DesktopTower } from '@phosphor-icons/react';

import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';

const themeOrder = ['light', 'dark', 'system'] as const;

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const currentIndex = themeOrder.indexOf(theme);
  const nextTheme = themeOrder[(currentIndex + 1) % themeOrder.length];

  const Icon = {
    light: Sun,
    dark: MoonStars,
    system: DesktopTower,
  }[theme];

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon-sm'
      aria-label={`Switch theme, current ${theme}`}
      title={`Theme: ${theme}`}
      onClick={() => setTheme(nextTheme)}
      className='bg-secondary/70 dark:bg-secondary/40'
    >
      <Icon size={18} />
    </Button>
  );
};

