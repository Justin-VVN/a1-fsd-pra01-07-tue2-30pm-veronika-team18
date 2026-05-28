'use client';

import Image from 'next/image';
import VenueCard from './VenueCard';

import './home.css';
import { useEffect, useRef, useState } from 'react';
import { Button, FormControl, Input } from '@chakra-ui/react';

export default function HomePage() {
  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);

  useEffect(() => {
    const localStorageVenues = localStorage.getItem('vv_venues') || '[]';

    if (localStorageVenues) {
      setVenues(JSON.parse(localStorageVenues));
      setAllVenues(JSON.parse(localStorageVenues));
    } else {
      console.log('null');
    }
  }, []);

  const searchQueryRef = useRef(null);

  const onVenueSearch = (evt: React.SubmitEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (searchQueryRef.current) {
      const searchQuery = searchQueryRef.current.value;

      if (!searchQuery) {
        alert('You need to enter something to search');
        return;
      }

      const lsVenues = localStorage.getItem('vv_venues') || '[]';
      try {
        const allVenues = JSON.parse(lsVenues);
        let filteredVenues = allVenues.filter(
          (dbVenue) =>
            dbVenue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dbVenue.location?.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        console.log('filteredVenues', filteredVenues);

        if (capacityRef.current && capacityRef.current.value) {
          filteredVenues = filteredVenues.filter(venue => venue.capacity >= Number(capacityRef.current.value))
        }

        setVenues(filteredVenues);
      } catch { }

      // reset search query after done
      searchQueryRef.current.value = '';
    }
  };

  const capacityRef = useRef(null);

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
