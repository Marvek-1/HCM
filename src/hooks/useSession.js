/**
 * moscript://codex/v1
 * id:       mo-osl-usesession-hooks
 * name:     useSession — Reservation Countdown Manager
 * element:  🜄
 * trigger:  UI_RESERVATION
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Time is a shared resource. Respect the queue."
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { sessionAPI } from '../services/api';

export const useSession = (sessionId) => {
  const [session, setSession] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(!!sessionId);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const validate = useCallback(async (sid) => {
    const id = sid || sessionId;
    if (!id) return;

    try {
      const res = await sessionAPI.validate(id);
      if (res.valid) {
        setSession(res);
        setTimeRemaining(res.timeRemaining);
        setIsValid(true);
      } else {
        setSession(null);
        setTimeRemaining(0);
        setIsValid(false);
      }
    } catch (err) {
      setError(err.message);
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (sessionId) {
      validate(sessionId);
    }
    return clearTimer;
  }, [sessionId, validate]);

  useEffect(() => {
    if (isValid && timeRemaining > 0) {
      clearTimer();
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsValid(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isValid, timeRemaining]);

  const extend = async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      const res = await sessionAPI.extend(sessionId);
      if (res.success) {
        setTimeRemaining(res.timeRemaining);
        setSession((prev) => ({ ...prev, extensionsRemaining: res.extensionsRemaining }));
        setIsValid(true);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const release = async () => {
    if (!sessionId) return;
    try {
      await sessionAPI.release(sessionId);
      clearTimer();
      setSession(null);
      setTimeRemaining(0);
      setIsValid(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const formatTime = () => {
    if (!timeRemaining) return '00:00';
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    session,
    timeRemaining,
    isValid,
    loading,
    error,
    extend,
    release,
    validate,
    formatTime: formatTime(),
    isExpiringSoon: timeRemaining < 180, // < 3 mins
  };
};

export default useSession;
