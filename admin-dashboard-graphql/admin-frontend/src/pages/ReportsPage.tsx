import React from 'react';
import { gql, useQuery } from '@apollo/client';


const TOP_POPULAR_VENUES = gql`
  query TopPopularVenues {
    topPopularVenues {
      bookingCount
      mostPopularDay
      mostPopularTimeSlot
      venue {
        id name location capacity price imgSrc
        owner { fullName }
      }
    }
  }
`;

const TOP_ACTIVE_HIRERS = gql`
  query TopActiveHirers {
    topActiveHirers {
      hirerId
      hirerName
      hirerEmail
      totalBookings
      successfulBookings
    }
  }
`;


interface PopularVenueReport {
  bookingCount: number;
  mostPopularDay: string | null;
  mostPopularTimeSlot: string | null;
  venue: {
    id: string; name: string; location: string;
    capacity: number; price: number; imgSrc: string;
    owner: { fullName: string } | null;
  };
}

interface ActiveHirerReport {
  hirerId: number; hirerName: string; hirerEmail: string;
  totalBookings: number; successfulBookings: number;
}

const rankClass = (i: number) =>
  i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : 'rank-3';


export default function ReportsPage() {
  const {
    data: venueData, loading: venueLoading, error: venueError,
  } = useQuery<{ topPopularVenues: PopularVenueReport[] }>(TOP_POPULAR_VENUES);

  const {
    data: hirerData, loading: hirerLoading, error: hirerError,
  } = useQuery<{ topActiveHirers: ActiveHirerReport[] }>(TOP_ACTIVE_HIRERS);

  return (
    <div>
      <h1 className="page-title">Reports</h1>

      <div className="reports-grid">
        {/* ── Top 3 Popular Venues ─────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h2>🏆 Top 3 Most Popular Venues</h2>
          </div>

          {venueLoading && <p className="spinner">Loading…</p>}
          {venueError  && <p className="error-msg">{venueError.message}</p>}

          {venueData?.topPopularVenues.map((row, i) => (
            <div key={row.venue.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: '1rem' }}>{row.venue.name}</strong>
                <p style={{ color: '#555', fontSize: '.85rem', margin: '.2rem 0' }}>
                  {row.venue.location} · Capacity {row.venue.capacity} · ${row.venue.price}/night
                </p>
                <p style={{ fontSize: '.85rem', color: '#333' }}>
                  <strong>{row.bookingCount}</strong> booking{row.bookingCount !== 1 ? 's' : ''}
                </p>
                {row.mostPopularDay && (
                  <p style={{ fontSize: '.82rem', color: '#0369a1' }}>
                    📅 Most popular day: <strong>{row.mostPopularDay}</strong>
                  </p>
                )}
                {row.mostPopularTimeSlot && (
                  <p style={{ fontSize: '.82rem', color: '#0369a1' }}>
                    🕐 Most popular slot: <strong>{row.mostPopularTimeSlot}</strong>
                  </p>
                )}
                {row.venue.owner && (
                  <p style={{ fontSize: '.8rem', color: '#888' }}>
                    Managed by {row.venue.owner.fullName}
                  </p>
                )}
              </div>
            </div>
          ))}

          {venueData?.topPopularVenues.length === 0 && (
            <p style={{ color: '#888' }}>No booking data available yet.</p>
          )}
        </div>

        {/* ── Top 3 Active Hirers ──────────────────────────────────── */}
        <div className="card">
          <div className="card-header">
            <h2>🏅 Top 3 Most Active Hirers</h2>
          </div>

          {hirerLoading && <p className="spinner">Loading…</p>}
          {hirerError  && <p className="error-msg">{hirerError.message}</p>}

          {hirerData?.topActiveHirers.map((row, i) => {
            const successRate = row.totalBookings > 0
              ? Math.round((row.successfulBookings / row.totalBookings) * 100)
              : 0;

            return (
              <div key={row.hirerId} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                <span className={`rank-badge ${rankClass(i)}`}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1rem' }}>{row.hirerName}</strong>
                  <p style={{ color: '#555', fontSize: '.82rem', margin: '.2rem 0' }}>{row.hirerEmail}</p>
                  <p style={{ fontSize: '.85rem' }}>
                    <strong>{row.totalBookings}</strong> total application{row.totalBookings !== 1 ? 's' : ''} ·{' '}
                    <strong style={{ color: '#059669' }}>{row.successfulBookings}</strong> successful
                  </p>
                  {/* Success rate bar */}
                  <div style={{ marginTop: '.4rem', background: '#e9ecef', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${successRate}%`, background: '#059669', height: '100%', borderRadius: '4px', transition: 'width .4s' }} />
                  </div>
                  <p style={{ fontSize: '.75rem', color: '#888', marginTop: '.2rem' }}>
                    {successRate}% success rate
                  </p>
                </div>
              </div>
            );
          })}

          {hirerData?.topActiveHirers.length === 0 && (
            <p style={{ color: '#888' }}>No hirer data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
