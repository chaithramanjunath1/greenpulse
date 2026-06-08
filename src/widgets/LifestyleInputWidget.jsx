import { useState } from 'react';
import PropTypes from 'prop-types';

const SECTOR_OPTIONS = {
  commute: {
    label: 'Transportation',
    kinds: [
      { value: 'sedan', label: 'Car (Sedan)', unit: 'km' },
      { value: 'suv', label: 'Car (SUV)', unit: 'km' },
      { value: 'motorbike', label: 'Motorbike', unit: 'km' },
      { value: 'metro', label: 'Metro / Subway', unit: 'km' },
      { value: 'rail', label: 'Train', unit: 'km' },
      { value: 'airline_domestic', label: 'Domestic Flight', unit: 'km' },
      { value: 'airline_overseas', label: 'International Flight', unit: 'km' },
      { value: 'pedal', label: 'Bicycle', unit: 'km' },
      { value: 'on_foot', label: 'Walking', unit: 'km' },
    ],
  },
  diet: {
    label: 'Food & Diet',
    kinds: [
      { value: 'red_meat', label: 'Red Meat', unit: 'servings' },
      { value: 'poultry', label: 'Poultry', unit: 'servings' },
      { value: 'seafood', label: 'Seafood', unit: 'servings' },
      { value: 'dairy_product', label: 'Dairy', unit: 'servings' },
      { value: 'plant_based', label: 'Plant-Based', unit: 'servings' },
      { value: 'grains', label: 'Grains / Rice', unit: 'servings' },
      { value: 'bakery', label: 'Bread / Bakery', unit: 'servings' },
    ],
  },
  household: {
    label: 'Home Energy',
    kinds: [
      { value: 'grid_power', label: 'Electricity', unit: 'kWh' },
      { value: 'gas_heating', label: 'Natural Gas', unit: 'kWh' },
      { value: 'fuel_oil', label: 'Heating Oil', unit: 'litres' },
    ],
  },
  consumption: {
    label: 'Shopping',
    kinds: [
      { value: 'garment', label: 'Clothing', unit: 'items' },
      { value: 'gadget', label: 'Electronics', unit: 'items' },
      { value: 'home_goods', label: 'Furniture / Home', unit: 'items' },
    ],
  },
};

const SECTOR_KEYS = Object.keys(SECTOR_OPTIONS);

/**
 * Single-view activity input form with sector-based dropdowns.
 * Allows users to log commute, diet, household, and consumption activities.
 */
const LifestyleInputWidget = ({ onSubmitEntry, isProcessing }) => {
  const [sector, setSector] = useState(SECTOR_KEYS[0]);
  const [kind, setKind] = useState(SECTOR_OPTIONS[SECTOR_KEYS[0]].kinds[0].value);
  const [amount, setAmount] = useState('');

  const currentSector = SECTOR_OPTIONS[sector];
  const currentKind = currentSector.kinds.find((k) => k.value === kind);
  const unitLabel = currentKind ? currentKind.unit : '';

  const handleSectorChange = (e) => {
    const newSector = e.target.value;
    setSector(newSector);
    setKind(SECTOR_OPTIONS[newSector].kinds[0].value);
    setAmount('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }
    onSubmitEntry({ sector, kind, amount: numAmount });
    setAmount('');
  };

  return (
    <form className="gp-card gp-animate-in" onSubmit={handleSubmit}>
      <h2 className="gp-subheading" style={{ marginBottom: 'var(--gp-space-lg)' }}>
        Log an Activity
      </h2>

      <div className="gp-grid gp-grid--3col" style={{ marginBottom: 'var(--gp-space-md)' }}>
        <div className="gp-field">
          <label className="gp-label" htmlFor="field-sector">Sector</label>
          <select
            id="field-sector"
            className="gp-select"
            value={sector}
            onChange={handleSectorChange}
          >
            {SECTOR_KEYS.map((key) => (
              <option key={key} value={key}>{SECTOR_OPTIONS[key].label}</option>
            ))}
          </select>
        </div>

        <div className="gp-field">
          <label className="gp-label" htmlFor="field-kind">Activity</label>
          <select
            id="field-kind"
            className="gp-select"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {currentSector.kinds.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>

        <div className="gp-field">
          <label className="gp-label" htmlFor="field-amount">Amount ({unitLabel})</label>
          <input
            id="field-amount"
            className="gp-input"
            type="number"
            min="0"
            step="any"
            placeholder={`Enter ${unitLabel}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        className="gp-btn gp-btn--primary"
        disabled={isProcessing || !amount}
        aria-label="Log this activity and calculate emissions"
        id="btn-log-activity"
      >
        {isProcessing ? 'Processing...' : '➕ Log Activity'}
      </button>
    </form>
  );
};

LifestyleInputWidget.propTypes = {
  onSubmitEntry: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
};

LifestyleInputWidget.defaultProps = {
  isProcessing: false,
};

export default LifestyleInputWidget;
