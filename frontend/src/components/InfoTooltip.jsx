import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

/**
 * Click-to-open info tooltip rendered via portal so it escapes parent `overflow: hidden`.
 *
 * Simple usage (backward compatible):
 *   <InfoTooltip text="Short help string" />
 *
 * Rich usage:
 *   <InfoTooltip
 *     title="Overall Realisation"
 *     sections={[
 *       { label: 'What it shows', body: '...' },
 *       { label: 'Formula', body: 'Collected ÷ Worked Value × 100', mono: true },
 *       { label: 'How to read it', body: '...' },
 *     ]}
 *     nextStep={{ label: 'Financial Deep Dive', to: '/financial' }}
 *   />
 */
export default function InfoTooltip({ text, title, sections, nextStep }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, placement: 'top' });
  const anchorRef = useRef(null);
  const popRef = useRef(null);
  const navigate = useNavigate();

  const isRich = !!title || !!sections;

  const recomputePosition = () => {
    if (!anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    const popW = isRich ? 380 : 280;
    const popH = popRef.current ? popRef.current.offsetHeight : 160;
    const margin = 10;

    // Prefer above; flip below if not enough room
    let placement = 'top';
    let top = r.top - popH - margin;
    if (top < 8) {
      placement = 'bottom';
      top = r.bottom + margin;
    }

    // Horizontal: centre on icon, clamp to viewport
    let left = r.left + r.width / 2 - popW / 2;
    if (left < 8) left = 8;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;

    setCoords({ top, left, placement });
  };

  useLayoutEffect(() => {
    if (open) recomputePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (anchorRef.current?.contains(e.target)) return;
      if (popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => recomputePosition();
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(v => !v);
  };

  const handleNext = () => {
    if (nextStep?.to) {
      setOpen(false);
      navigate(nextStep.to);
    }
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        className={`info-icon ${open ? 'info-icon-open' : ''}`}
        aria-label="More information"
        aria-expanded={open}
        onClick={handleToggle}
      >
        i
      </button>
      {open && createPortal(
        <div
          ref={popRef}
          className={`info-tooltip info-tooltip-open info-tooltip-${coords.placement} ${isRich ? 'info-tooltip-rich' : ''}`}
          style={{ top: coords.top, left: coords.left, width: isRich ? 380 : 280 }}
          role="tooltip"
        >
          {isRich ? (
            <>
              {title && <div className="info-tt-title">{title}</div>}
              {sections?.map((s, i) => (
                <div key={i} className="info-tt-section">
                  <div className="info-tt-label">{s.label}</div>
                  <div className={`info-tt-body ${s.mono ? 'info-tt-mono' : ''}`}>{s.body}</div>
                </div>
              ))}
              {nextStep && (
                <button className="info-tt-next" onClick={handleNext} type="button">
                  → {nextStep.label}
                </button>
              )}
            </>
          ) : (
            <div className="info-tt-simple">{text}</div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
