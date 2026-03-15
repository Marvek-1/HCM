/**
 * moscript://codex/v1
 * id:       mo-osl-useidempotency-hooks
 * name:     useIdempotency — Request Dedup Manager
 * element:  🜄
 * trigger:  UI_SUBMISSION
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "Every click is a commitment.
 *  Duplicate clicks are noise."
 */

import { useState, useCallback, useRef } from 'react';

export const useIdempotency = (context = 'default') => {
  const [key, setKey] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const keyRef = useRef(null);

  const generateKey = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const newKey = `IDEM-${context}-${timestamp}-${random}`;
    setKey(newKey);
    keyRef.current = newKey;
    return newKey;
  }, [context]);

  const resetKey = useCallback(() => {
    setKey(null);
    keyRef.current = null;
    setIsProcessing(false);
  }, []);

  const startProcessing = useCallback(() => {
    if (!key) {
      generateKey();
    }
    setIsProcessing(true);
    return keyRef.current;
  }, [key, generateKey]);

  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);

  return {
    key,
    generateKey,
    resetKey,
    startProcessing,
    stopProcessing,
    isProcessing,
  };
};

export default useIdempotency;
