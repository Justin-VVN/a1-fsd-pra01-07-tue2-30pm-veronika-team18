import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import ContextProvider from '@/app/store/ContextProvider';
import VenuePage from './page';

describe('Test Venue Page', () => {
  beforeEach(() => {
    const mockVenueData = [
      {
        id: 1776482777023,
        name: 'aa vendor',
        imgSrc:
          'https://ik.imagekit.io/tvlk/blog/2023/11/go-and-share-camping-ho-tri-an-1.jpg',
        location: 'hehe',
        capacity: 1,
        price: 2,
        owner: {
          name: 'aa',
          email: 'aa@aa.aa',
          phoneNumber: '123466',
        },
      },
      {
        id: 1776483570668,
        name: 'c venue',
        imgSrc:
          'https://mia.vn/media/uploads/blog-du-lich/camping-ho-tri-an-4-1693238728.jpg',
        location: 'ccc',
        capacity: 100,
        price: 5,
        owner: {
          name: 'c',
          email: 'c@c.c',
          id: '3da176fc-f516-4114-b615-2784675720c2',
        },
      },
    ];

    localStorage.clear();
    localStorage.setItem('vv_venues', JSON.stringify(mockVenueData));
  });

  test('page renders correctly with id that exists in the database (from local storage)', async () => {
    // Wrap in await act so React fully resolves the use(params) Promise suspension
    // and commits the real UI before we start querying.
    await act(async () => {
      render(
        <ChakraProvider>
          <ContextProvider>
            <Suspense fallback={null}>
              <VenuePage params={Promise.resolve({ id: '1776483570668' })} />
            </Suspense>
          </ContextProvider>
        </ChakraProvider>,
      );
    });

    expect(await screen.findByText(/c venue/i)).toBeInTheDocument();

    const venueTitle = await screen.findByRole('heading', {
      level: 2,
      name: /c venue/i,
    });
    expect(venueTitle).toBeInTheDocument();
    expect(venueTitle).toHaveTextContent('c venue');
  });
});
