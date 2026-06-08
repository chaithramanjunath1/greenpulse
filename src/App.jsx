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
 * Uses an object map for viewport rendering.
 */
const VIEWPORT_MAP = {
  'command-center': CommandCenterViewport,
  'impact-ledger': ImpactLedgerViewport,
  'action-blueprint': ActionBlueprintViewport,
};

/**
 * Inner shell that reads from the LifestyleContext.
 * Separated from App so that useLifestyle is called inside the Provider.
 */
const AppCore = () => {
  const { activeViewport, dispatch } = useLifestyle();

  const handleNavigate = (viewportId) => {
    dispatch({ type: ACTIONS.SHIFT_VIEWPORT, payload: viewportId });
  };

  const ActiveViewport = VIEWPORT_MAP[activeViewport];

  return (
    <div className="gp-app-shell">
      <NavigationSpine
        activeViewport={activeViewport}
        onShift={handleNavigate}
      />
      <main className="gp-viewport-area">
        <div key={activeViewport} className="gp-animate-in">
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
