import { useState, useEffect } from 'react';
import eventService from '../services/eventService';

interface EventGate {
  checking: boolean;
  blocked: boolean;
}

export function useEventGate(slug: string): EventGate {
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    eventService.getEventBySlug(slug)
      .then(() => setChecking(false))
      .catch((err: any) => {
        if (err?.response?.status === 403 && err?.response?.data?.error === 'TEST_MODE') {
          setBlocked(true);
        }
        setChecking(false);
      });
  }, [slug]);

  return { checking, blocked };
}
