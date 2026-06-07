import React, { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import VenueFormModal from '../components/VenueFormModal';
import AssignVendorModal from '../components/AssignVendorModal';


const GET_VENUES = gql`
  query GetVenues {
    venues {
      id name imgSrc location capacity price suitability featured onSale
      owner { id fullName email }
    }
  }
`;

const GET_VENDORS = gql`
  query GetVendors {
    vendors { id fullName email }
  }
`;

const DELETE_VENUE = gql`
  mutation DeleteVenue($id: ID!) {
    deleteVenue(id: $id)
  }
`;

const TOGGLE_FEATURED = gql`
  mutation ToggleFeatured($id: ID!) {
    toggleFeaturedVenue(id: $id) { id featured }
  }
`;


interface Owner { id: string; fullName: string; email: string; }
export interface VenueRow {
  id: string; name: string; imgSrc: string; location: string;
  capacity: number; price: number; suitability: string[];
  featured: boolean; onSale: boolean; owner: Owner | null;
}


export default function VenuesPage() {
  const { data, loading, error, refetch } = useQuery<{ venues: VenueRow[] }>(GET_VENUES);
  const { data: vendorData } = useQuery<{ vendors: Owner[] }>(GET_VENDORS);

  const [deleteVenue] = useMutation(DELETE_VENUE, {
    onCompleted: () => refetch(),
  });
  const [toggleFeatured] = useMutation(TOGGLE_FEATURED, {
    onCompleted: () => refetch(),
  });

  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueRow | null>(null);
  const [assignVenue, setAssignVenue] = useState<VenueRow | null>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this venue? This cannot be undone.')) {
      deleteVenue({ variables: { id } });
    }
  };

  const handleEdit = (venue: VenueRow) => {
    setEditingVenue(venue);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingVenue(null);
    setShowForm(true);
  };

  if (loading) return <p className="spinner">Loading venues…</p>;
  if (error)   return <p className="error-msg">Error: {error.message}</p>;

  const venues = data?.venues ?? [];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h1 className="page-title">Venue Management</h1>
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Venue</button>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Price/night</th>
                <th>Owner (Vendor)</th>
                <th>Featured</th>
                <th>On Sale</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {venues.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: '#888' }}>No venues found.</td></tr>
              )}
              {venues.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>
                    <img src={v.imgSrc} alt={v.name} className="img-thumb"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/50x40?text=VV'; }} />
                  </td>
                  <td><strong>{v.name}</strong></td>
                  <td>{v.location}</td>
                  <td>{v.capacity}</td>
                  <td>${v.price}</td>
                  <td>{v.owner ? `${v.owner.fullName}` : <em style={{ color: '#aaa' }}>Unassigned</em>}</td>
                  <td>
                    <button
                      className={`badge ${v.featured ? 'badge-green' : 'badge-gray'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
              title="Click to toggle featured status"
                      onClick={() => toggleFeatured({ variables: { id: v.id } })}
                    >
                      {v.featured ? '★ Featured' : '☆ Regular'}
                    </button>
                  </td>
                  <td>
                    <span className={`badge ${v.onSale ? 'badge-red' : 'badge-gray'}`}>
                      {v.onSale ? '🔥 On Sale' : '—'}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(v)}>Edit</button>
                      <button className="btn btn-sm btn-warning" onClick={() => setAssignVenue(v)}>Assign Vendor</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <VenueFormModal
          venue={editingVenue}
          vendors={vendorData?.vendors ?? []}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); refetch(); }}
        />
      )}

      {assignVenue && (
        <AssignVendorModal
          venue={assignVenue}
          vendors={vendorData?.vendors ?? []}
          onClose={() => setAssignVenue(null)}
          onSaved={() => { setAssignVenue(null); refetch(); }}
        />
      )}
    </div>
  );
}
