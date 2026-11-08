import { cn } from '@/lib/utils';

export function App() {
  return (
    <main className={cn('app-shell', 'min-h-dvh bg-background px-4 py-8 text-foreground')}>
      <h1 className="app-shell__title text-3xl font-semibold tracking-tight">Met Museum Explorer</h1>
    </main>
  );
}
