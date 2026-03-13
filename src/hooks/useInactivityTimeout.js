import { useState, useEffect, useCallback, useRef } from 'react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE = 60 * 1000;           // Show warning 1 minute before logout
const CHECK_INTERVAL = 1000;                // Check every second
const STORAGE_KEY = 'hcoms_last_activity';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

function getLastActivity() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : Date.now();
}

function setLastActivity() {
  localStorage.setItem(STORAGE_KEY, Date.now().toString());
}

export default function useInactivityTimeout(isLoggedIn, onLogout) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const warningShown = useRef(false);
  const onLogoutRef = useRef(onLogout);
  const intervalRef = useRef(null);

  // Keep logout ref current to avoid stale closure
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  // Record activity on login
  useEffect(() => {
    if (isLoggedIn) {
      setLastActivity();
    }
  }, [isLoggedIn]);

  // Main check loop — runs every second when logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setShowWarning(false);
      warningShown.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - getLastActivity();

      if (elapsed >= INACTIVITY_TIMEOUT) {
        // Time's up — logout
        clearInterval(intervalRef.current);
        setShowWarning(false);
        warningShown.current = false;
        localStorage.removeItem(STORAGE_KEY);
        onLogoutRef.current();
      } else if (elapsed >= INACTIVITY_TIMEOUT - WARNING_BEFORE) {
        // In warning window
        const remaining = Math.ceil((INACTIVITY_TIMEOUT - elapsed) / 1000);
        setSecondsLeft(remaining);
        if (!warningShown.current) {
          warningShown.current = true;
          setShowWarning(true);
        }
      } else {
        // Active — hide warning if it was showing
        if (warningShown.current) {
          warningShown.current = false;
          setShowWarning(false);
        }
      }
    }, CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoggedIn]);

  // Listen for user activity (only resets if warning is NOT showing)
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleActivity = () => {
      if (!warningShown.current) {
        setLastActivity();
      }
    };

    ACTIVITY_EVENTS.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [isLoggedIn]);

  // Handle tab becoming visible — check immediately
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = Date.now() - getLastActivity();
        if (elapsed >= INACTIVITY_TIMEOUT) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setShowWarning(false);
          warningShown.current = false;
          localStorage.removeItem(STORAGE_KEY);
          onLogoutRef.current();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isLoggedIn]);

  // "Stay Logged In" button handler
  const stayLoggedIn = useCallback(() => {
    setLastActivity();
    warningShown.current = false;
    setShowWarning(false);
  }, []);

  return { showWarning, secondsLeft, stayLoggedIn };
}
