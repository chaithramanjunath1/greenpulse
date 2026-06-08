import PropTypes from 'prop-types';

const NAV_ITEMS = [
  { id: 'command-center', icon: '🏠', label: 'Overview' },
  { id: 'impact-ledger', icon: '📊', label: 'Logging' },
  { id: 'action-blueprint', icon: '🎯', label: 'Actions' },
];

/**
 * Vertical navigation spine — sidebar on desktop, bottom bar on mobile.
 * Renders navigation buttons for each viewport and highlights the active one.
 */
const NavigationSpine = ({ activeViewport, onShift }) => {
  return (
    <nav className="gp-spine" role="navigation" aria-label="Main navigation">
      <div className="gp-spine__brand" aria-hidden="true">🌿</div>

      {NAV_ITEMS.map((item) => {
        const isActive = activeViewport === item.id;
        const className = `gp-spine__link${isActive ? ' gp-spine__link--active' : ''}`;

        return (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={className}
            onClick={() => onShift(item.id)}
            aria-label={`Navigate to ${item.label}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="gp-spine__icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

NavigationSpine.propTypes = {
  activeViewport: PropTypes.string.isRequired,
  onShift: PropTypes.func.isRequired,
};

export default NavigationSpine;
