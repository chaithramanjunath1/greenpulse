import { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ACTIONS } from './ActionCatalog.js';
import { aggregateEmissions } from '../algorithms/CarbonMath.js';

const STORAGE_KEY = 'greenpulse_activities';
const COMPLETED_KEY = 'greenpulse_completed';

/* ── Initial State ───────────────────────────────────────────── */
const buildInitialState = () => {
  let activities = [];
  let completedActionIds = [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      activities = JSON.parse(raw);
    }
  } catch (_e) {
    activities = [];
  }

  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (raw) {
      completedActionIds = JSON.parse(raw);
    }
  } catch (_e) {
    completedActionIds = [];
  }

  return {
    activities,
    advice: [],
    completedActionIds,
    activeViewport: 'command-center',
    isProcessing: false,
    fault: null,
  };
};

/* ── Reducer ─────────────────────────────────────────────────── */
const lifestyleReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.APPEND_ACTIVITY:
      return {
        ...state,
        activities: [action.payload, ...state.activities],
      };

    case ACTIONS.DISCARD_ACTIVITY:
      return {
        ...state,
        activities: state.activities.filter((_a, idx) => idx !== action.payload),
      };

    case ACTIONS.HYDRATE_ACTIVITIES:
      return {
        ...state,
        activities: action.payload,
      };

    case ACTIONS.STORE_ADVICE:
      return {
        ...state,
        advice: action.payload,
      };

    case ACTIONS.MARK_ACTION_DONE:
      if (state.completedActionIds.includes(action.payload)) {
        return state;
      }
      return {
        ...state,
        completedActionIds: [...state.completedActionIds, action.payload],
      };

    case ACTIONS.UNMARK_ACTION_DONE:
      return {
        ...state,
        completedActionIds: state.completedActionIds.filter((id) => id !== action.payload),
      };

    case ACTIONS.SHIFT_VIEWPORT:
      return {
        ...state,
        activeViewport: action.payload,
        fault: null,
      };

    case ACTIONS.SIGNAL_LOADING:
      return { ...state, isProcessing: true, fault: null };

    case ACTIONS.SIGNAL_READY:
      return { ...state, isProcessing: false };

    case ACTIONS.SIGNAL_FAULT:
      return { ...state, isProcessing: false, fault: action.payload };

    case ACTIONS.CLEAR_FAULT:
      return { ...state, fault: null };

    default:
      return state;
  }
};

/* ── Context ─────────────────────────────────────────────────── */
const LifestyleContext = createContext(null);

/**
 * Provider component that wraps the app with lifestyle state.
 * Uses useReducer with Context for centralized state management.
 */
export const LifestyleProvider = ({ children }) => {
  const [state, dispatch] = useReducer(lifestyleReducer, null, buildInitialState);

  const emissions = aggregateEmissions(state.activities);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.activities));
    } catch (_e) {
      /* storage full or unavailable */
    }
  }, [state.activities]);

  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(state.completedActionIds));
    } catch (_e) {
      /* storage full or unavailable */
    }
  }, [state.completedActionIds]);

  const contextValue = {
    ...state,
    emissions,
    dispatch,
  };

  return (
    <LifestyleContext.Provider value={contextValue}>
      {children}
    </LifestyleContext.Provider>
  );
};

LifestyleProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Hook to access the lifestyle state and dispatch from any descendant component.
 * @returns {Object} State and dispatch
 */
export const useLifestyle = () => {
  const ctx = useContext(LifestyleContext);
  if (!ctx) {
    throw new Error('useLifestyle must be used within a LifestyleProvider');
  }
  return ctx;
};
