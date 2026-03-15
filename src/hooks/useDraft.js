/**
 * moscript://codex/v1
 * id:       mo-osl-usedraft-hooks
 * name:     useDraft — Draft Persistence Manager
 * element:  🜂
 * trigger:  UI_DRAFT_CHANGE
 * domain:   African Flame Initiative
 * author:   The Flame Architect — MoStar Industries ⚡
 *
 * "A draft is a bridge across a failed connection."
 */

import { useState, useEffect, useCallback } from 'react';

const DRAFT_PREFIX = 'hcoms_draft_';

export const useDraft = (draftId = 'default') => {
  const storageKey = `${DRAFT_PREFIX}${draftId}`;
  const [draft, setDraft] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : null;
  });

  const saveDraft = useCallback((data) => {
    setDraft(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    setDraft(null);
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const updateField = useCallback((field, value) => {
    setDraft((prev) => {
      const updated = { ...prev, [field]: value, lastModified: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  }, [storageKey]);

  // Periodic auto-save message for the console (emulated)
  useEffect(() => {
    if (draft) {
      const timer = setInterval(() => {
        // In production, this might sync with server /api/orders/drafts
        console.log(`[useDraft] Order draft ${draftId} synced to local storage.`);
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [draft, draftId]);

  return {
    draft,
    saveDraft,
    clearDraft,
    updateField,
    hasDraft: !!draft,
    lastSaved: draft?.lastModified || null,
  };
};

export default useDraft;
