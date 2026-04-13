// components
import { ThemeProvider } from '@/components/ThemeProvider';
import { TopAppBar } from '@/components/TopAppBar';

export const App = () => {
  return (
    <ThemeProvider>
      <TopAppBar />
    </ThemeProvider>
  );
};
