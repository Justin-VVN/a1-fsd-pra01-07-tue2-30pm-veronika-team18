import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import type { VenueRow } from '../pages/VenuesPage';

const CREATE_VENUE = gql`
  mutation CreateVenue($input: VenueInput!) {
    createVenue(input: $input) { id name }
  }
`;

const UPDATE_VENUE = gql`
  mutation UpdateVenue($id: ID!, $input: VenueInput!) {
    updateVenue(id: $id, input: $input) { id name }
  }
`;

interface Props {
  venue: VenueRow | null;
  vendors: { id: string; fullName: string }[];
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  name: string; imgSrc: string; location: string;
  capacity: string; price: string; suitability: string; ownerId: string;
}

export default function VenueFormModal({ venue, vendors, onClose, onSaved }: Props) {
  const isEdit = !!venue;

  const [form, setForm] = useState<FormState>({
    name:       venue?.name      ?? '',
    imgSrc:     venue?.imgSrc    ?? '',
    location:   venue?.location  ?? '',
    capacity:   String(venue?.capacity ?? ''),
    price:      String(venue?.price    ?? ''),
    suitability: venue?.suitability?.join(', ') ?? '',
    ownerId:    venue?.owner?.id ?? '',
  });
  const [error, setError] = useState('');

  const [createVenue, { loading: creating }] = useMutation(CREATE_VENUE, {
    onCompleted: onSaved,
    onError: (e) => setError(e.message),
  });
  const [updateVenue, { loading: updating }] = useMutation(UPDATE_VENUE, {
    onCompleted: onSaved,
    onError: (e) => setError(e.message),
  });

  const loading = creating || updating;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.imgSrc || !form.location || !form.capacity || !form.price) {
      setError('All fields except suitability are required.');
      return;
    }

    const input = {
      name:       form.name.trim(),
      imgSrc:     form.imgSrc.trim(),
      location:   form.location.trim(),
      capacity:   parseInt(form.capacity),
      price:      parseFloat(form.price),
      suitability: form.suitability
        ? form.suitability.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      ownerId: form.ownerId ? parseInt(form.ownerId) : undefined,
    };

    if (isEdit) {
      updateVenue({ variables: { id: venue!.id, input } });
    } else {
      createVenue({ variables: { input } });
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Venue' : 'Add New Venue'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Venue Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. The Grand Hall" />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input name="imgSrc" value={form.imgSrc} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Melbourne CBD" />
          </div>
          <div className="form-group">
            <label>Capacity</label>
            <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="100" min="1" />
          </div>
          <div className="form-group">
            <label>Price per Night ($)</label>
            <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="500" min="0" step="0.01" />
          </div>
          <div className="form-group">
            <label>Suitability (comma-separated)</label>
            <input name="suitability" value={form.suitability} onChange={handleChange}
              placeholder="wedding, birthday, concert" />
          </div>
          <div className="form-group">
            <label>Assign Vendor</label>
            <select name="ownerId" value={form.ownerId} onChange={handleChange}>
              <option value="">— Unassigned —</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.fullName}</option>
              ))}
            </select>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Update Venue' : 'Create Venue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
