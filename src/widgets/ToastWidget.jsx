import { useEffect } from 'react';
import { useLifestyle } from '../flux/LifestyleDispatcher.jsx';
import { ACTIONS } from '../flux/ActionCatalog.js';

/**
 * Toast notification widget for instant user feedback.
 * Auto-dismisses after 4 seconds. Supports success, reward, and info types.
 */
const ToastWidget = () => {
  const { toast, dispatch } = useLifestyle();

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: ACTIONS.HIDE_TOAST });
    }, 4000);

    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) {
    return null;
  }

  let icon = 'ℹ️';
  if (toast.type === 'success') {
    icon = '✅';
  }
  if (toast.type === 'reward') {
    icon = '🎉';
  }

  return (
    <div className="gp-toast gp-animate-slide-up" role="alert" aria-live="assertive">
      <div className="gp-toast__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="gp-toast__content">
        <p className="gp-toast__title">{toast.title}</p>
        {toast.message && <p className="gp-toast__message">{toast.message}</p>}
      </div>
      <button 
        className="gp-toast__close" 
        onClick={() => dispatch({ type: ACTIONS.HIDE_TOAST })}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastWidget;
