import React, { useState, useEffect } from 'react';

export default function TicketTimer({ ticketId, inProgressAt, createdAt, status, isOverdue, onAutoResolve }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (status !== 'In Progress') return;

    // Use inProgressAt or fallback to createdAt
    const rawTime = inProgressAt || createdAt;
    if (!rawTime) return;

    // Safe UTC Date Parse
    const startTime = new Date(rawTime.endsWith('Z') ? rawTime : rawTime + 'Z').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      const SLA_SECONDS = 120; // 2 Minutes
      const remainingSeconds = SLA_SECONDS - elapsedSeconds;

      if (remainingSeconds <= 0) {
        setTimeLeft('OVERDUE');
        setIsExpired(true);
        clearInterval(interval);
        
        // Auto trigger resolve API call back to dashboard
        if (onAutoResolve) {
          onAutoResolve(ticketId);
        }
      } else {
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ticketId, inProgressAt, createdAt, status, onAutoResolve]);

  // 1. CLOSED TICKETS BADGE
  if (status === 'Closed') {
    return isOverdue ? (
      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs font-bold">
        Overdue
      </span>
    ) : (
      <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">
        Closed
      </span>
    );
  }

  // 2. IN PROGRESS TICKETS BADGE & LIVE TIMER
  if (status === 'In Progress') {
    return (
      <span
        className={`px-2 py-1 text-xs font-bold rounded ${
          isExpired || timeLeft === 'OVERDUE'
            ? 'bg-red-600 text-white'
            : 'bg-yellow-500 text-black animate-pulse'
        }`}
      >
        {isExpired || timeLeft === 'OVERDUE' ? '⚠️ Overdue' : `⏱️ Time Left: ${timeLeft || 'Calculating...'}`}
      </span>
    );
  }

  return null;
}