import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import type { VenueRow } from '../pages/VenuesPage';

const ASSIGN_VENDOR = gql`
  mutation AssignVendor($venueId: ID!, $vendorId: ID!) {
    assignVendorToVenue(venueId: $venueId, vendorId: $vendorId) {
      id name owner { id fullName }
    }
  }
`;

interface Props {
  venue: VenueRow;
  vendors: { id: string; fullName: string; email: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export default function AssignVendorModal({ venue, vendors, onClose, onSaved }: Props) {
  const [vendorId, setVendorId] = useState(venue.owner?.id ?? '');
  const [error, setError] = useState('');

  const [assignVendor, { loading }] = useMutation(ASSIGN_VENDOR, {
    onCompleted: onSaved,
    onError: (e) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!vendorId) { setError('Please select a vendor.'); return; }
    assignVendor({ variables: { venueId: venue.id, vendorId } });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Assign Vendor to "{venue.name}"</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <p className="mb-2" style={{ color: '#555', fontSize: '.9rem' }}>
          Current owner: <strong>{venue.owner?.fullName ?? 'Unassigned'}</strong>
          <br />
          A venue can only belong to one vendor. Reassigning will swap the vendor.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Vendor</label>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
              <option value="">— Select a vendor —</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.fullName} ({v.email})</option>
              ))}
            </select>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !vendorId}>
              {loading ? 'Assigning…' : 'Assign Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
