import { useContext } from 'react';
import { DiscoveryContext, type DiscoveryContextValue } from './DiscoveryContext';

/**
 * Reads the discovery run. It throws outside its provider rather than
 * returning a half-state: a screen that renders without the run would draw
 * nothing and say nothing, which is harder to diagnose than an error at the
 * first render.
 */
export function useDiscovery(): DiscoveryContextValue {
  const discovery = useContext(DiscoveryContext);

  if (discovery === null) {
    throw new Error('useDiscovery must be called inside a DiscoveryProvider.');
  }

  return discovery;
}
