import React, { useState, useEffect, useRef } from 'react';

export default function HeritageLoader({ visible, label = 'Otwieranie prywatnego archiwum…' }) {
  const [rendered, setRendered] = useState(Boolean(visible));
  const [exiting, setExiting] = useState(false);
  const shownAtRef = useRef(visible ? Date.now() : 0);

  useEffect(() => {
    if (visible) {
      shownAtRef.current = Date.now();
      setRendered(true);
      setExiting(false);
      return undefined;
    }

    if (!rendered) return undefined;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const minDisplayMs = prefersReducedMotion ? 0 : 1150;
    const elapsed = Date.now() - shownAtRef.current;
    const remainingDelay = Math.max(0, minDisplayMs - elapsed);
    const fadeDurationMs = prefersReducedMotion ? 150 : 480;

    let fadeTimer;
    const holdTimer = setTimeout(() => {
      setExiting(true);
      fadeTimer = setTimeout(() => {
        setRendered(false);
        setExiting(false);
      }, fadeDurationMs);
    }, remainingDelay);

    return () => {
      clearTimeout(holdTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [visible, rendered]);

  if (!rendered) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`heritage-loader-overlay${exiting ? ' is-exiting' : ''}`}
    >
      <div className="heritage-loader-content">
        <div className="heritage-loader-emblem" aria-hidden="true">
          {/* Warstwa 1: Korona i pień drzewa (leśna zieleń #244638) rosnąca w górę z przewężenia pnia */}
          <img
            src={`${import.meta.env.BASE_URL}logo-tree.png`}
            alt=""
            draggable={false}
            className="tk-logo-layer tk-logo-crown"
          />
          {/* Warstwa 2: Korzenie (antyczne złoto #C29A55) zapuszczające się w dół */}
          <img
            src={`${import.meta.env.BASE_URL}logo-tree.png`}
            alt=""
            draggable={false}
            className="tk-logo-layer tk-logo-roots"
          />
        </div>

        <div className="heritage-loader-brand">
          Twoje<span>Korzenie</span>
        </div>
        <div className="heritage-loader-label">{label}</div>
      </div>
    </div>
  );
}
