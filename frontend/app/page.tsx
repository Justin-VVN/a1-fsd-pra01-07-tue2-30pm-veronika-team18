'use client';

import Image from 'next/image';
import VenueCard from './VenueCard';

import './home.css';
import { useEffect, useRef, useState } from 'react';
import { Button, FormControl, Input } from '@chakra-ui/react';

type Venue = {
  id: number;
  name: string;
  location: string;
  capacity: number;
  price: number;
  imgSrc: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
};

export default function HomePage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
  // Fetch venues from backend API
 useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('http://localhost:3001/api/venues', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}`);
        }

        const data: Venue[] = await res.json();
        setVenues(data);
        setAllVenues(data);
      } catch (err: any) {
        console.error('Failed to fetch venues:', err);
        setError('Backend not reachable. Please try again later.');
        setVenues([]);
        setAllVenues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const searchQueryRef = useRef<HTMLInputElement>(null);
  const capacityRef = useRef<HTMLInputElement>(null);

  const onVenueSearch = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const searchQuery = searchQueryRef.current?.value.trim() || '';
    const minCapacity = capacityRef.current?.value ? Number(capacityRef.current.value) : 0;

    if (!searchQuery && minCapacity === 0) {
      setVenues(allVenues);
      return;
    }

    let filteredVenues = [...allVenues];

    // Filter by search query (name or location)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredVenues = filteredVenues.filter((venue) =>
        venue.name?.toLowerCase().includes(q) ||
        venue.location?.toLowerCase().includes(q)
      );
    }

    // Filter by minimum capacity
    if (minCapacity > 0) {
      filteredVenues = filteredVenues.filter((venue) => venue.capacity >= minCapacity);
    }

    setVenues(filteredVenues);

    // Clear search input
    if (searchQueryRef.current) searchQueryRef.current.value = '';
  };

  const clearSearch = () => {
    setVenues(allVenues);
    if (searchQueryRef.current) searchQueryRef.current.value = '';
    if (capacityRef.current) capacityRef.current.value = '';
  };

  if (loading) {
    return <div className="text-center py-20 text-xl">Loading venues...</div>;
  }

  return (
    <div>

      {/*Introduction to website*/}
      <div className='px-12 pt-8'>
        <div className='relative w-full h-[520px] rounded-3xl overflow-hidden shadow-xl'>
          <Image
            src='/MelbourneCity.jpg'
            alt='Melbourne skyline'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-black/35'></div>

          <div className='absolute inset-0 flex items-center'>
            <div className='px-12 md:px-20 text-white w-full'>

              <h1
                className='mb-2 text-white'
                style={{
                  fontSize: 'clamp(4rem, 10vw, 8rem)',
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: '-0.04em',
                }}
              >Venue Vendors
              </h1>
              <p className='text-2xl md:text-3xl font-semibold mb-3 max-w-3xl'>
                Melbourne’s Home for Event Hiring
              </p>
              <p className='text-base md:text-lg text-gray-200 max-w-xl'>
                Discover venues and manage your bookings in one place.
              </p>
            </div>
          </div>
        </div>
      </div>



      <div className='px-32'>
        <div className='px-50 mt-4'>
          <form onSubmit={onVenueSearch}>
            <FormControl className='flex flex-row items-center justify-center gap-2'>
              <Input
                type='text'
                name='query'
                placeholder='Search venue by name or location...'
                ref={searchQueryRef}
              />
              <Button
                // mt={4}
                // colorScheme='blue'
                type='submit'
              >
                Search
              </Button>
              <Button onClick={() => setVenues(allVenues)}>Clear</Button>
            </FormControl>
            <Input
              type='number'
              name='query'
              placeholder='Capacity'
              ref={capacityRef}
            />
          </form>
        </div>
      </div>

      <div id='venues-container' className='py-8'>
        {venues.map((venue) => (
          <VenueCard key={venue.name} venue={venue} />
        ))}
      </div>
    </div>
  );
}
