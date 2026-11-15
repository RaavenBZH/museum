import { Component, type ReactNode } from 'react';
import { NoticePanel } from '@/components/layout/NoticePanel';
import { ButtonLink } from '@/components/ui/Button';

/**
 * The one class component of the application, because a boundary cannot be
 * written as a function: React offers no hook for `getDerivedStateFromError`.
 *
 * It exists for a concrete reason rather than for form. The screens read a
 * payload whose fifty-seven fields are typed `unknown` until the domain layer
 * has looked at them, and `useDiscovery` throws by design when it is called
 * outside its provider. Without a boundary, either would unmount the whole
 * tree and leave a blank page.
 *
 * It carries no `componentDidCatch`: there is nowhere to report to — no
 * logging service, and the console is barred by the project's lint rules — so
 * a hook that only exists to log would be dead weight.
 *
 * The way out is a real page load and not a router link: the tree that failed
 * is the one still mounted, so the visitor needs a fresh one.
 */
type ErrorBoundaryState = {
  hasFailed: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasFailed: true };
  }

  render() {
    if (!this.state.hasFailed) {
      return this.props.children;
    }

    return (
      <NoticePanel
        className="error-boundary"
        title="This screen stopped working."
        lead="Something went wrong while drawing this screen. Loading the application again should put it right."
        role="alert"
        action={
          <ButtonLink variant="primary" href="/">
            Reload the application
          </ButtonLink>
        }
      />
    );
  }
}
