'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from 'graphql-ws';

interface DiscountVenue {
  id: string;
  name: string;
  location: string;
}

interface DiscountNotification {
  message: string;
  discountPercent: number;
  venue: DiscountVenue;
}

const SUBSCRIPTION_QUERY = `
  subscription OnVenueDiscount {
    venueDiscountNotification {
      message
      discountPercent
      venue { id name location }
    }
  }
`;

const ADMIN_WS_URL =
  process.env.NEXT_PUBLIC_ADMIN_WS_URL || 'ws://localhost:4001/graphql';

export default function VenueDiscountAlert() {
  const [notifications, setNotifications] = useState<DiscountNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const dismiss = useCallback((venueId: string) => {
    setDismissed((prev) => new Set([...prev, venueId]));
  }, []);

  useEffect(() => {
    const client = createClient({ url: ADMIN_WS_URL });

    const unsubscribe = client.subscribe<{
      venueDiscountNotification: DiscountNotification;
    }>(
      { query: SUBSCRIPTION_QUERY },
      {
        next: ({ data }) => {
          if (data?.venueDiscountNotification) {
            setNotifications((prev) => {
              const already = prev.some(
                (n) => n.venue.id === data.venueDiscountNotification.venue.id
              );
              return already ? prev : [data.venueDiscountNotification, ...prev];
            });
            setTimeout(() => {
              setDismissed((prev) =>
                new Set([...prev, data.venueDiscountNotification.venue.id])
              );
            }, 30_000);
          }
        },
        error: () => {
        },
        complete: () => {},
      }
    );

    return () => {
      unsubscribe();
      client.dispose();
    };
  }, []);

  const visible = notifications.filter((n) => !dismissed.has(n.venue.id));
  if (visible.length === 0) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: 'min(600px, 90vw)',
      }}
    >
      {visible.map((n) => (
        <div
          key={n.venue.id}
          style={{
            background: '#fff5f5',
            border: '2px solid #dc2626',
            borderRadius: '10px',
            padding: '14px 18px',
            boxShadow: '0 4px 20px rgba(220,38,38,.25)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>🔥</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '.95rem' }}>
              <strong style={{ color: '#dc2626', fontWeight: 800 }}>
                {n.venue.name}
              </strong>{' '}
              is now on sale!
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '.85rem', color: '#dc2626', fontWeight: 700 }}>
              🎉 {n.discountPercent}% DISCOUNT — Limited time offer
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '.8rem', color: '#666' }}>
              {n.venue.location}
            </p>
          </div>
          <button
            onClick={() => dismiss(n.venue.id)}
            aria-label="Dismiss notification"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#dc2626', fontSize: '1.2rem', lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
