import { useRef, useEffect } from 'react';
import { LifestyleProvider, useLifestyle } from './flux/LifestyleDispatcher.jsx';
import { ACTIONS } from './flux/ActionCatalog.js';
import NavigationSpine from './widgets/NavigationSpine.jsx';
import CommandCenterViewport from './viewports/CommandCenterViewport.jsx';
import ImpactLedgerViewport from './viewports/ImpactLedgerViewport.jsx';
import ActionBlueprintViewport from './viewports/ActionBlueprintViewport.jsx';
import ToastWidget from './widgets/ToastWidget.jsx';
import ErrorShield from './widgets/ErrorShield.jsx';
import './design/foundation.css';
import './design/motion.css';

/**
 * Viewport map — renders the correct viewport based on activeViewport state.
 * Uses an object lookup for O(1) viewport resolution.
 */
const VIEWPORT_MAP = {
  'command-center': CommandCenterViewport,
  'impact-ledger': ImpactLedgerViewport,
  'action-blueprint': ActionBlueprintViewport,
};

/** Viewport display names for screen readers. */
const VIEWPORT_LABELS = {
  'command-center': 'Overview',
  'impact-ledger': 'Activity Logging',
  'action-blueprint': 'Action Plan',
};

/**
 * Inner shell that reads from the LifestyleContext.
 * Separated from App so that useLifestyle is called inside the Provider.
 */
const AppCore = () => {
  const { activeViewport, dispatch } = useLifestyle();
  const viewportRef = useRef(null);
  const isFirstRender = useRef(true);

  const handleNavigate = (viewportId) => {
    dispatch({ type: ACTIONS.SHIFT_VIEWPORT, payload: viewportId });
  };

  /* Move focus to main content on viewport change for screen readers */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (viewportRef.current) {
      viewportRef.current.focus();
    }
  }, [activeViewport]);

  const ActiveViewport = VIEWPORT_MAP[activeViewport];
  const viewportLabel = VIEWPORT_LABELS[activeViewport] || 'Page';

  return (
    <div className="gp-app-shell">
      <NavigationSpine
        activeViewport={activeViewport}
        onShift={handleNavigate}
      />
      <main
        id="main-content"
        className="gp-viewport-area"
        ref={viewportRef}
        tabIndex={-1}
        aria-label={`${viewportLabel} section`}
        style={{ outline: 'none' }}
      >
        <div key={activeViewport} className="gp-animate-in" aria-live="polite">
          {ActiveViewport ? (
            <ActiveViewport onNavigate={handleNavigate} />
          ) : (
            <p className="gp-caption">Unknown viewport</p>
          )}
        </div>
      </main>
      <ToastWidget />
    </div>
  );
};

/**
 * Root component wrapping the app in the LifestyleProvider.
 */
const App = () => {
  return (
    <ErrorShield>
      <LifestyleProvider>
        <AppCore />
      </LifestyleProvider>
    </ErrorShield>
  );
};

export default App;
