import { Component } from 'react';
import PropTypes from 'prop-types';

/**
 * Error boundary component that catches rendering errors in child components.
 * Displays a user-friendly fallback UI instead of crashing the entire app.
 * Required for production-quality React applications.
 */
class ErrorShield extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(_error) {
    // In production, this would send to an error reporting service like Sentry
    // console.error is omitted to prevent leaking stack traces to the client console
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="gp-card" role="alert" style={{ textAlign: 'center', padding: 'var(--gp-space-2xl)' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gp-rose)', marginBottom: 'var(--gp-space-md)' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <h2 className="gp-subheading" style={{ marginBottom: 'var(--gp-space-sm)' }}>Something went wrong</h2>
          <p className="gp-caption" style={{ marginBottom: 'var(--gp-space-md)' }}>
            {this.state.errorMessage || 'An unexpected error occurred.'}
          </p>
          <button
            className="gp-btn gp-btn--ghost"
            onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            id="btn-error-retry"
          >
            🔄 Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorShield.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorShield;
