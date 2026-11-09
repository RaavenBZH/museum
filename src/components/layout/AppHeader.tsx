import { BrandLogo } from '@/components/brand/BrandLogo';
import { ThemeToggleButton } from '@/components/theme/ThemeToggleButton';

export function AppHeader() {
  return (
    <header className="app-header flex items-center justify-between gap-4 py-6">
      <BrandLogo />
      <ThemeToggleButton />
    </header>
  );
}
