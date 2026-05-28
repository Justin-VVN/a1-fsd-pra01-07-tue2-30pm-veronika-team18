'use client';

import { useEffect, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  Badge,
  Button,
  VStack,
  HStack,
  Divider,
  Flex,
  useToast,
} from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';

export default function MyBookingsPage() {
  const { currentUser } = useContext(AppContext);
  const router = useRouter();
  const toast = useToast();

  const [myBookings, setMyBookings] = useState<any[]>([]);

  //defining booking history
  const bookingHistory = myBookings.filter(
    (booking) => booking.status === 'confirmed',
  );

  useEffect(() => {
    if (!currentUser) return;

    const lsBookings = localStorage.getItem('vv_bookings') || '[]';

    try {
      const bookings = JSON.parse(lsBookings);

      const filtered = bookings.filter(
        (bk: any) => bk.hirer?.id === currentUser.id,
      );

      setMyBookings(filtered);
      console.log(filtered);
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // useEffect(() => {
  //   if (!currentUser) {
  //     router.push('/signin');
  //   }
  // }, [currentUser, router]);

  const cancelBooking = (id: number) => {
    // const updated = myBookings.filter((b) => b.id !== id);
    // setMyBookings(updated);
    const updated = myBookings.map((b: any) =>
      b.id === id ? { ...b, status: 'cancelled' } : b,
    );
    localStorage.setItem('vv_bookings', JSON.stringify(updated));
    setMyBookings(updated);

    // localStorage.setItem('vv_bookings', JSON.stringify(updated));

    toast({ title: 'Booking cancelled', status: 'info' });
  };

  {
    /*Preferences ranking section */
  }
  const setPreferenceRank = (bookingId: number, rank: number) => {
    const allBookings = JSON.parse(localStorage.getItem('vv_bookings') || '[]');

    const updatedAllBookings = allBookings.map((booking: any) =>
      booking.id === bookingId ? { ...booking, preferenceRank: rank } : booking,
    );

    localStorage.setItem('vv_bookings', JSON.stringify(updatedAllBookings));

    const updatedMyBookings = updatedAllBookings.filter(
      (booking: any) => booking.hirer?.id === currentUser.id,
    );

    setMyBookings(updatedMyBookings);

    toast({
      title: `Preference rank ${rank} saved`,
      status: 'success',
    });
  };

  if (!currentUser) {
    return <Text p={8}>Redirecting to sign in...</Text>;
  }

  console.log(myBookings);
  const renderDocuments = (docs: any) => {
    if (!docs) return <Text color="gray.400">No documents uploaded</Text>;

    return (
      <VStack align="start" spacing={4} mt={3}>
        {/* Driver's License - Image */}
        {docs.driverLicense && (
          <Box>
            <Text fontWeight="semibold" fontSize="sm" mb={1}>Driver's License</Text>
            <img
              src={`data:image/jpeg;base64,${docs.driverLicense}`}
              alt="Driver's License"
              style={{ maxWidth: '220px', borderRadius: '8px', border: '1px solid #ddd' }}
            />
          </Box>
        )}

        {/* Public Liability Insurance - PDF */}
        {docs.publicLiabilityInsurance && (
          <Box>
            <Text fontWeight="semibold" fontSize="sm" mb={1}>Public Liability Insurance</Text>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${docs.publicLiabilityInsurance}`;
                link.download = 'Public_Liability_Insurance.pdf';
                link.target = '_blank';
                link.click();
              }}
            >
              📄 View Insurance Certificate
            </Button>
          </Box>
        )}

        {/* Business Certificate - PDF */}
        {docs.businessCertificate && (
          <Box>
            <Text fontWeight="semibold" fontSize="sm" mb={1}>Business Registration Certificate</Text>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${docs.businessCertificate}`;
                link.download = 'Business_Registration_Certificate.pdf';
                link.target = '_blank';
                link.click();
              }}
            >
              📄 View Business Certificate
            </Button>
          </Box>
        )}

        {/* ABN Number */}
        {docs.abnNumber && (
          <Box>
            <Text fontWeight="semibold" fontSize="sm" mb={1}>ABN Number</Text>
            <Text fontSize="lg" fontWeight="medium" color="blue.600">
              {docs.abnNumber}
            </Text>
          </Box>
        )}
      </VStack>
    );
  };
  return (
    <Box maxW='80vw' mx='auto' py={10}>
      <Heading mb={8} textAlign='center' color='blue.600'>
        My Bookings – Welcome, {currentUser.name}!
      </Heading>

      {myBookings.length === 0 ? (
        <Box textAlign='center' py={20}>
          <Text fontSize='2xl' color='gray.500'>
            You have no bookings yet.
          </Text>
          <Button mt={6} colorScheme='blue' onClick={() => router.push('/')}>
            Browse Venues
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={[1, 2]} spacing={8}>
          {myBookings.map((booking) => (
            <Box
              key={booking.id}
              bg='white'
              borderRadius='2xl'
              boxShadow='lg'
              overflow='hidden'
              p={6}
            >
              <Flex gap={6}>
                <Image
                  src={booking.venue.imgSrc}
                  alt={booking.venue.name}
                  width='140px'
                  height='140px'
                  objectFit='cover'
                  borderRadius='xl'
                />

                <Box flex='1'>
                  <HStack justify='space-between' mb={3}>
                    <Heading size='md'>{booking.venue.name}</Heading>
                    <Badge
                      colorScheme={
                        booking.status === 'confirmed'
                          ? 'green'
                          : booking.status === 'cancelled'
                            ? 'red'
                            : 'orange'
                      }
                      px={3}
                      py={1}
                      borderRadius='full'
                    >
                      {booking.status.toUpperCase()}
                    </Badge>
                  </HStack>

                  <VStack align='start' spacing={2} fontSize='sm'>
                    <HStack>
                      <Text fontWeight="semibold">Event Name:</Text>
                      <Text>{booking.eventName || 'N/A'}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight='semibold'>Check-in:</Text>
                      <Text>{booking.checkIn}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight='semibold'>Check-out:</Text>
                      <Text>{booking.checkOut}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight="semibold">Event Time:</Text>
                      <Text>{booking.eventTime || 'N/A'}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight="semibold">Event Duration:</Text>
                      <Text>{booking.eventDuration || 'N/A'}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight='semibold'>Nights:</Text>
                      <Text>{booking.nights}</Text>
                    </HStack>

                    <HStack>
                      <Text fontWeight='semibold'>Guests:</Text>
                      <Text>{booking.guests}</Text>
                    </HStack>
                    
                    <Box pt={2}>
                      <Text fontWeight='semibold' mb={2}>
                        Venue Preference Rank
                      </Text>

                      <HStack spacing={2}>
                        <Button
                          size='xs'
                          onClick={() => setPreferenceRank(booking.id, 1)}
                          colorScheme={
                            booking.preferenceRank === 1 ? 'blue' : 'gray'
                          }
                        >
                          1
                        </Button>

                        <Button
                          size='xs'
                          onClick={() => setPreferenceRank(booking.id, 2)}
                          colorScheme={
                            booking.preferenceRank === 2 ? 'blue' : 'gray'
                          }
                        >
                          2
                        </Button>

                        <Button
                          size='xs'
                          onClick={() => setPreferenceRank(booking.id, 3)}
                          colorScheme={
                            booking.preferenceRank === 3 ? 'blue' : 'gray'
                          }
                        >
                          3
                        </Button>
                      </HStack>

                      <Text mt={2}>
                        Current Rank: {booking.preferenceRank || 'Not set'}
                      </Text>
                    </Box>
                  </VStack>

                  <Box pt={3} w="full">
                    <Text fontWeight="semibold" mb={2}>Uploaded Documents</Text>
                    {renderDocuments(booking.additionalDocuments)}
                  </Box>

                  {/* <Divider my={4} />
                  <img
                    src={`data:image/jpeg;base64,${booking.additionalDocuments?.driverLicense}`}
                    alt='Driver Licence'
                  />
                  <Divider my={4} /> */}

                  <HStack justify='space-between'>
                    <Text fontSize='lg' fontWeight='bold'>
                      Total: ${booking.total.toFixed(2)}
                    </Text>
                    {booking.status === 'pending' && (
                      <Button
                        size='sm'
                        colorScheme='red'
                        variant='outline'
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </HStack>
                </Box>
              </Flex>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {/*booking history section*/}
      <Box mt={12}>
        <Heading size='md' mb={6} color='blue.600'>
          Hiring History
        </Heading>

        {bookingHistory.length === 0 ? (
          <Text color='gray.500'>No past bookings yet.</Text>
        ) : (
          <SimpleGrid columns={[1, 2]} spacing={6}>
            {bookingHistory.map((booking) => (
              //card for each booking summary
              <Box
                key={booking.id}
                bg='white'
                borderRadius='xl'
                boxShadow='md'
                p={5}
              >
                <VStack align='start' spacing={2}>
                  <Text>
                    <strong>Venue:</strong> {booking.venue.name}
                  </Text>
                  <Text>
                    <strong>Location:</strong> {booking.venue.location}
                  </Text>
                  <Text>
                    <strong>Event:</strong> {booking.eventName || 'Not set yet'}
                  </Text>
                  <Text>
                    <strong>Date of Hire:</strong> {booking.checkIn}
                  </Text>
                  <Text>
                    <strong>Rating:</strong> {booking.rating || 0} / 5
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Box>
    </Box>
  );
}
