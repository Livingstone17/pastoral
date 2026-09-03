import { useEffect, useRef } from 'react';
import { getSunTimes, isCurrentlyNight } from '../utils/sun';

interface Options {
  enabled: boolean;
  onDark: () => void;
  onLight: () => void;
}

/**
 * Automatically toggles dark mode at sunset / sunrise based on the user's
 * geolocation. Recalculates on every page load and schedules a timeout for
 * the next transition.
 */
export function useAutoDarkMode({ enabled, onDark, onLight }: Options) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    let cancelled = false;

    function schedule(lat: number, lng: number) {
      if (cancelled) return;

      const now = new Date();
      const { sunrise, sunset } = getSunTimes(now, lat, lng);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const isNight = currentMinutes >= sunset || currentMinutes < sunrise;

      // Apply immediately
      if (isNight) {
        onDark();
      } else {
        onLight();
      }

      // Schedule next transition
      let nextTransitionMinutes: number;
      if (isNight) {
        // Night → next sunrise
        nextTransitionMinutes = sunrise - currentMinutes;
        if (nextTransitionMinutes <= 0) {
          // sunrise is tomorrow
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowTimes = getSunTimes(tomorrow, lat, lng);
          nextTransitionMinutes = 24 * 60 - currentMinutes + tomorrowTimes.sunrise;
        }
      } else {
        // Day → sunset
        nextTransitionMinutes = sunset - currentMinutes;
      }

      const ms = Math.max(nextTransitionMinutes * 60 * 1000, 60_000); // at least 1 min

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!cancelled) schedule(lat, lng);
      }, ms);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!cancelled) schedule(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // Geolocation denied — fall back to system preference
          const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
          if (prefersDark) onDark(); else onLight();
        },
        { timeout: 10_000 },
      );
    } else {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      if (prefersDark) onDark(); else onLight();
    }

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, onDark, onLight]);
}
