import React, { useState } from 'react';
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client';


const GET_VENUES = gql`
  query GetVenuesForDiscount {
    venues { id name location onSale featured }
  }
`;

const TRIGGER_DISCOUNT = gql`
  mutation TriggerDiscount($venueId: ID!) {
    triggerVenueDiscount(venueId: $venueId) { id name onSale }
  }
`;

const CLEAR_DISCOUNT = gql`
  mutation ClearDiscount($venueId: ID!) {
    clearVenueDiscount(venueId: $venueId) { id name onSale }
  }
`;

const DISCOUNT_SUBSCRIPTION = gql`
  subscription OnVenueDiscount {
    venueDiscountNotification {
      message
      discountPercent
      venue { id name location }
    }
  }
`;


interface VenueLite {
  id: string; name: string; location: string; onSale: boolean; featured: boolean;
}

interface DiscountEvent {
  message: string;
  discountPercent: number;
  venue: { id: string; name: string; location: string };
  receivedAt: Date;
}


export default function NotificationsPage() {
  const { data, loading, error, refetch } = useQuery<{ venues: VenueLite[] }>(GET_VENUES);
  const [events, setEvents] = useState<DiscountEvent[]>([]);

  const [triggerDiscount] = useMutation(TRIGGER_DISCOUNT, {
    onCompleted: () => refetch(),
  });
  const [clearDiscount] = useMutation(CLEAR_DISCOUNT, {
    onCompleted: () => refetch(),
  });


  useSubscription(DISCOUNT_SUBSCRIPTION, {
    onData: ({ data: subData }) => {
      const notification = subData.data?.venueDiscountNotification;
      if (notification) {
        setEvents((prev) => [{ ...notification, receivedAt: new Date() }, ...prev]);
      }
    },
  });

  const venues = data?.venues ?? [];

  return (
    <div>
      <h1 className="page-title">Discount Notifications</h1>
      <p style={{ color: '#555', marginBottom: '1.5rem', fontSize: '.9rem' }}>
        Triggering a discount broadcasts a <strong>real-time GraphQL subscription event</strong> to all
        connected clients — including the VV website's hirer and vendor dashboards — simultaneously.
        The venue name will appear <strong style={{ color: '#dc2626' }}>red and bold</strong> with a
        45% discount warning on the VV site.
      </p>

      <div className="notifications-grid">

        <div className="card">
          <div className="card-header"><h2>📋 All Venues</h2></div>

          {loading && <p className="spinner">Loading…</p>}
          {error   && <p className="error-msg">{error.message}</p>}

          {venues.map((v) => (
            <div key={v.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '.75rem 0', borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <strong style={{ color: v.onSale ? '#dc2626' : 'inherit' }}>
                  {v.onSale ? '🔥 ' : ''}{v.name}
                </strong>
                <p style={{ fontSize: '.8rem', color: '#666' }}>{v.location}</p>
                {v.onSale && (
                  <span className="badge badge-red" style={{ marginTop: '.2rem' }}>
                    45% OFF — On Sale
                  </span>
                )}
              </div>
              <div className="action-row">
                {!v.onSale ? (
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => triggerDiscount({ variables: { venueId: v.id } })}
                  >
                    🔔 Trigger 45% Sale
                  </button>
                ) : (
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => clearDiscount({ variables: { venueId: v.id } })}
                  >
                    ✕ Clear Sale
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>


        <div className="card">
          <div className="card-header">
            <h2>📡 Live Event Log</h2>
            {events.length > 0 && (
              <button className="btn btn-sm btn-secondary" onClick={() => setEvents([])}>
                Clear Log
              </button>
            )}
          </div>

          <p style={{ fontSize: '.82rem', color: '#888', marginBottom: '1rem' }}>
            Events received via <code>venueDiscountNotification</code> GraphQL subscription:
          </p>

          {events.length === 0 ? (
            <p style={{ color: '#bbb', textAlign: 'center', padding: '2rem 0' }}>
              No events yet — trigger a discount to see the real-time broadcast here.
            </p>
          ) : (
            <ul className="event-log">
              {events.map((ev, i) => (
                <li key={i}>
                  <strong style={{ color: '#dc2626' }}>{ev.venue.name}</strong>
                  {' — '}{ev.message}
                  <div className="time">{ev.receivedAt.toLocaleTimeString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
