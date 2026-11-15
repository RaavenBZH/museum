import { NoticePanel } from '@/components/layout/NoticePanel';
import { ButtonRouterLink } from '@/components/ui/Button';

/**
 * The screen for an address the application does not serve. It says what
 * happened in one line and offers the one way out a visitor needs: the home,
 * where every mode is presented.
 */
export function NotFoundPage() {
  return (
    <NoticePanel
      className="not-found-page"
      title="This page does not exist."
      lead="The address you asked for is not one of this application's screens."
      action={
        <ButtonRouterLink variant="primary" to="/">
          Back to the home page
        </ButtonRouterLink>
      }
    />
  );
}
