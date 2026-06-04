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
  FormControl,
  FormLabel,
  Input,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Select,
  Progress,
} from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';
import { VENUE_API, BOOKING_API, USER_API, apiFetch } from '@/lib/api';

export default function VenuesPage() {
  const { currentUser } = useContext(AppContext);
  const router = useRouter();
  const toast = useToast();

  const [myVenues, setMyVenues] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '',
    imgSrc: '',
    location: '',
    capacity: '',
    price: '',
  });

  //Blocked dates component useStates
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [blockForm, setBlockForm] = useState({
    venueId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });

  // useEffect(() => {
  //     if (!currentUser) router.push('/signin');
  // }, [currentUser, router]);
  // useEffect(() => {
  //   if (!currentUser) {
  //     router.push('/signin');
  //     return;
  //   }

  //   if (currentUser.type !== 'vendor') {
  //     router.push('/');
  //     return;
  //   }
  // }, [currentUser, router]);


  // Load my posted venues
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchVenues = async () => {
      try {
        const allVenues = await apiFetch<any[]>(`${VENUE_API}/venues`);
        const mine = allVenues.filter((v: any) => {
          const ownerId = v?.owner?.id ?? v?.ownerId ?? v?.owner_id;
          return String(ownerId) === String(currentUser.id);
        });
        setMyVenues(mine);
      } catch (err) {
        console.error('Failed to load venues for vendor:', err);
        setMyVenues([]);
      }
    };

    fetchVenues();
  }, [currentUser]);

  // Load booking requests for my venues
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchBookings = async () => {
      try {
        const [allBookings, allVenues, allUsers] = await Promise.all([
          apiFetch<any[]>(`${BOOKING_API}/bookings`),
          apiFetch<any[]>(`${VENUE_API}/venues`).catch((e) => {
            console.warn('Could not fetch venues for vendor enrichment', e);
            return [] as any[];
          }),
          apiFetch<any[]>(`${USER_API}/users`).catch((e) => {
            console.warn('Could not fetch users for vendor enrichment', e);
            return [] as any[];
          }),
        ]);

        const venueMap = new Map((allVenues || []).map((v: any) => [String(v.id), v]));
        const userMap = new Map((allUsers || []).map((u: any) => [String(u.id), u]));

        const mine = allBookings.filter((b: any) => {
          // try nested venue owner
          const nestedOwnerId = b?.venue?.owner?.id ?? b?.venue?.ownerId ?? b?.venue?.owner_id;

          if (nestedOwnerId) return String(nestedOwnerId) === String(currentUser.id);

          // fallback: lookup venue by id
          const venueId = b?.venue?.id ?? b?.venueId ?? b?.venue_id;
          const venue = venueId ? venueMap.get(String(venueId)) : null;
          const ownerId = venue?.owner?.id ?? venue?.ownerId ?? venue?.owner_id;
          return ownerId ? String(ownerId) === String(currentUser.id) : false;
        });

        // enrich bookings with venue objects when missing
        const enriched = mine.map((bk: any) => {
          const venueId = bk?.venue?.id ?? bk?.venueId ?? bk?.venue_id;
          const venue = bk?.venue ?? (venueId ? venueMap.get(String(venueId)) : null) ?? null;

          const hirerId = bk?.hirer?.id ?? bk?.hirerId ?? bk?.hirer_id;
          const hirer = bk?.hirer ?? (hirerId ? userMap.get(String(hirerId)) : null) ?? { id: hirerId ?? null, name: 'Unknown Hirer' };

          return { ...bk, venue: venue ?? { id: venueId ?? null, imgSrc: '/placeholder.png', name: 'Unknown Venue', location: '' }, hirer };
        });

        setBookingRequests(enriched);
      } catch (err) {
        console.error('Failed to load booking requests:', err);
        setBookingRequests([]);
      }
    };

    fetchBookings();
  }, [currentUser]);


  // Load blocked dates for my venues
  useEffect(() => {
    const fetchBlockedDates = async () => {
      try {
        const dates = await apiFetch<any[]>(`${VENUE_API}/blocked-dates`);
        setBlockedDates(dates || []);
      } catch (err) {
        console.error('Failed to load blocked dates:', err);
        setBlockedDates([]);
      }
    };

    fetchBlockedDates();
  }, []);

  const getCredibilityScore = (docs: any): number => {
    if (!docs) return 0;
    const count = Object.keys(docs).length;
    if (count === 1) return 1;
    if (count === 2) return 3;
    if (count >= 3) return 5;
    return 0;
  };

  const StarRating = ({ score }: { score: number }) => (
    <Text fontSize="2xl" color="yellow.400" letterSpacing="1px">
      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </Text>
  );

  const getHirerBookings = (hirerId: string) => {
    return bookingRequests.filter((booking: any) => {
      const id = booking?.hirer?.id ?? booking?.hirerId ?? booking?.hirer_id;
      return String(id) === String(hirerId);
    });
  };

const getHirerAverageRating = (hirerId: string) => {
  const hirerBookings = getHirerBookings(hirerId);

  const ratedBookings = hirerBookings.filter(
    (booking: any) => booking.status === 'confirmed' && Number(booking.rating) > 0
  );

  if (ratedBookings.length === 0) return 0;

  const total = ratedBookings.reduce(
    (sum: number, booking: any) => sum + Number(booking.rating),
    0
  );

  return total / ratedBookings.length;
};

  {/*handling blocked dates for venues*/ }
  const handleBlockVenue = () => {
    if (
      !blockForm.venueId ||
      !blockForm.startDate ||
      !blockForm.endDate
    ) {

      toast({
        title: 'Fill in all block dates here...',
        status: 'warning',
      });
      return;
    }

    const newBlockedPeriod = {
      id: Date.now(),
      venueId: Number(blockForm.venueId),
      startDate: blockForm.startDate,
      endDate: blockForm.endDate,
      reason: blockForm.reason,
    };

    const saveBlockedDates = async () => {
      try {
        const updated = await apiFetch<any>(`${VENUE_API}/blocked-dates`, {
          method: 'POST',
          body: JSON.stringify(newBlockedPeriod),
        });
        setBlockedDates((prev) => [...prev, updated]);
      } catch (err) {
        console.error('Failed to save blocked date:', err);
        toast({ title: 'Failed to block venue', status: 'error' });
      }
    };

    saveBlockedDates();

    setBlockForm({
      venueId: '',
      startDate: '',
      endDate: '',
      reason: '',
    });

    toast({
      title: 'Venue blocked',
      status: 'success',
    });
  };

  const getHirerInsights = () => {
    const hirerStats: { [key: string]: { name: string; accepted: number; total: number } } = {};

    bookingRequests.forEach((req) => {
      const hirerId = req.hirer?.id ?? req.hirerId ?? req.hirer_id ?? req.hirer?.name;
      const hirerName = req.hirer?.name ?? 'Unknown Hirer';

      if (!hirerStats[hirerId]) {
        hirerStats[hirerId] = { name: hirerName, accepted: 0, total: 0 };
      }

      hirerStats[hirerId].total += 1;
      if (req.status === 'confirmed') {
        hirerStats[hirerId].accepted += 1;
      }
    });

    const statsArray = Object.values(hirerStats);

    const mostChosen = [...statsArray]
      .sort((a, b) => b.accepted - a.accepted)
      .slice(0, 5);

    const leastChosen = [...statsArray]
      .sort((a, b) => a.accepted - b.accepted)
      .slice(0, 5);

    const neverSelected = statsArray.filter((s) => s.accepted === 0);

    return { mostChosen, leastChosen, neverSelected };
  };
  const { mostChosen, leastChosen, neverSelected } = getHirerInsights();
  
  const handlePostVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newVenue = {
      name: form.name,
      imgSrc: form.imgSrc,
      location: form.location,
      capacity: Number(form.capacity),
      price: Number(form.price),
      ownerId: currentUser.id,
    };

    try {
      const created = await apiFetch<any>(`${VENUE_API}/venues`, {
        method: 'POST',
        body: JSON.stringify(newVenue),
      });
      setMyVenues((prev) => [...prev, created]);

      toast({ title: 'Venue posted!', status: 'success' });
      setForm({ name: '', imgSrc: '', location: '', capacity: '', price: '' });
    } catch (err) {
      console.error('Failed to post venue:', err);
      toast({ title: 'Could not post venue', status: 'error' });
    }
  };

  const acceptBooking = async (bookingId: number) => {
    try {
      const payload = { status: 'confirmed' };
      // Keep only the working endpoint: PUT /bookings/:id
      const updatedBooking = await apiFetch<any>(`${BOOKING_API}/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setBookingRequests((prev) => prev.map((b) => (b.id === bookingId ? { ...updatedBooking, venue: b.venue ?? updatedBooking.venue, hirer: updatedBooking.hirer ?? b.hirer } : b)));
      toast({ title: 'Booking accepted', status: 'success' });
    } catch (err) {
      console.error('Failed to accept booking (PUT):', err);
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: 'Could not accept booking', description: msg, status: 'error', duration: 9000 });
    }
  };

  const rejectBooking = async (bookingId: number) => {
    try {
      const updatedBooking = await apiFetch<any>(`${BOOKING_API}/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      });

      setBookingRequests((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b)),
      );
      toast({ title: 'Booking rejected', status: 'info' });
    } catch (err) {
      console.error('Failed to reject booking:', err);
      toast({ title: 'Could not reject booking', status: 'error' });
    }
  };
  
  //Hirer rating section
  const rateHirer = async (bookingId: number, rating: number) => {
    try {
      const updatedBooking = await apiFetch<any>(`${BOOKING_API}/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ rating }),
      });

      setBookingRequests((prev) =>
        prev.map((b) => (b.id === bookingId ? updatedBooking : b)),
      );

      toast({
        title: `Hirer rated ${rating} stars`,
        status: 'success',
      });
    } catch (err) {
      console.error('Failed to rate hirer:', err);
      toast({ title: 'Could not rate hirer', status: 'error' });
    }
  };


  if (!currentUser || currentUser.type !== 'vendor') return <Text p={8}>Redirecting...</Text>;
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

        {/* ABN Number */}
        {docs.abnNumber && (
          <Box>
            <Text fontWeight="semibold" fontSize="sm" mb={1}>ABN Number</Text>
            <Text fontSize="lg" fontWeight="medium" color="blue.600">
              {docs.abnNumber}
            </Text>
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
      </VStack>
    );
  };

  return (
    <Box maxW='80vw' mx='auto' py={10}>
      <Heading mb={8} textAlign='center' color='blue.600'>
        Vendor Dashboard – Welcome, {currentUser.name}!
      </Heading>

      <Tabs colorScheme='blue' isFitted>
        <TabList>
          <Tab>Post New Venue</Tab>
          <Tab>Booking Requests ({bookingRequests.length})</Tab>
          <Tab>Hirer Insights</Tab>
        </TabList>

        <TabPanels>
          {/* Post New Venue */}
          <TabPanel>
            <Box bg='white' p={8} borderRadius='2xl' boxShadow='lg'>
              <form onSubmit={handlePostVenue}>
                <VStack spacing={5}>
                  <FormControl isRequired>
                    <FormLabel>Venue Name</FormLabel>
                    <Input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Image URL</FormLabel>
                    <Input
                      value={form.imgSrc}
                      onChange={(e) =>
                        setForm({ ...form, imgSrc: e.target.value })
                      }
                    />
                  </FormControl>
                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                  </FormControl>
                  <HStack>
                    <FormControl isRequired>
                      <FormLabel>Capacity</FormLabel>
                      <Input
                        type='number'
                        value={form.capacity}
                        onChange={(e) =>
                          setForm({ ...form, capacity: e.target.value })
                        }
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel>Price / night</FormLabel>
                      <Input
                        type='number'
                        value={form.price}
                        onChange={(e) =>
                          setForm({ ...form, price: e.target.value })
                        }
                      />
                    </FormControl>
                  </HStack>
                  <Button type='submit' colorScheme='blue' size='lg'>
                    Post Venue
                  </Button>
                </VStack>
              </form>
            </Box>

            {/*Blocked dates form*/}
            <Box mt={9}>
              <Heading size="md" mb={4}>Block Venue</Heading>

              <Select placeholder="Select venue"
                value={blockForm.venueId}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, venueId: e.target.value })
                }
              >

                {myVenues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>

              <Input
                mt={4}
                type="date"
                value={blockForm.startDate}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, startDate: e.target.value })
                }
              />

              <Input
                mt={4}
                type="date"
                value={blockForm.endDate}
                onChange={(e) =>
                  setBlockForm({ ...blockForm, endDate: e.target.value })
                }
              />

              <Button mt={5} colorScheme="red" onClick={handleBlockVenue}>
                Block
              </Button>
            </Box>

            <Heading size='md' mb={6}>
              My Venues ({myVenues.length})
            </Heading>

            {myVenues.length === 0 ? (
              <Text color='gray.500'>You haven't posted any venues yet.</Text>
            ) : (
              <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                {myVenues.map((venue) => (
                  <Box
                    key={venue.id}
                    bg='white'
                    borderRadius='xl'
                    boxShadow='md'
                    overflow='hidden'
                  >
                    <Image
                      src={venue.imgSrc}
                      alt={venue.name}
                      height='200px'
                      objectFit='cover'
                      w='full'
                    />
                    <Box p={4}>
                      <Heading size='md'>{venue.name}</Heading>
                      <Text color='gray.600'>{venue.location}</Text>
                      <HStack mt={3}>
                        <Badge colorScheme='green'>
                          Capacity: {venue.capacity}
                        </Badge>
                        <Text fontWeight='bold'>${venue.price}/night</Text>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </TabPanel>
          {/* My Venues List */}

          {/* Booking Requests */}
          <TabPanel>
            {bookingRequests.length === 0 ? (
              <Text>No pending booking requests.</Text>
            ) : (
              <SimpleGrid columns={[1, 2]} spacing={6}>
                {bookingRequests.map((req: any) => {
                  const score = getCredibilityScore(req.additionalDocuments);
                  const reputationScore = getHirerAverageRating(req.hirer?.id);
                  return (
                    <Box
                      key={req.id}
                      bg='white'
                      p={6}
                      borderRadius='2xl'
                      boxShadow='md'
                    >
                      <HStack>
                        <Image
                          src={req.venue.imgSrc}
                          alt=''
                          boxSize='80px'
                          borderRadius='lg'
                          objectFit='cover'
                        />
                        <Box flex={1}>
                          <Heading size='md'>{req.venue.name}</Heading>
                          <Text color='gray.500'>
                            Requested by: {req.hirer.name}
                          </Text>
                          <Text>
                            {req.checkIn} → {req.checkOut} ({req.nights} nights)
                          </Text>
                          <Text>
                            Guests: {req.guests} | Total: ${req.total}
                          </Text>
                        </Box>
                      </HStack>
                      {/* <div>
                      <h1>Addtional documents</h1>
                      <h2>Driver's License</h2>
                      <img
                        src={`data:image/jpeg;base64,${req.additionalDocuments?.driverLicense}`}
                        alt='Driver Licence'
                      />
                    </div> */}

                      <HStack mt={3}>
                        <Text fontWeight="semibold">Hirer Credibility:</Text>
                        <StarRating score={score} />
                        <Text fontSize="sm" color="gray.500">({score}/5)</Text>
                      </HStack>

                      <HStack mt={3}>
                       <Text fontWeight="semibold">Hirer Reputation:</Text>
                       <StarRating score={reputationScore} />
                       <Text fontSize="sm" color="gray.500">
                       ({reputationScore.toFixed(1)}/5)
                       </Text>
                      </HStack>

                      <Box pt={3} w="full">
                        <Text fontWeight="semibold" mb={2}>Uploaded Documents</Text>
                        {renderDocuments(req.additionalDocuments)}
                      </Box>

                      <HStack mt={6} spacing={4}>
                        {req.status === 'pending' && (
                          <>
                            <Button
                              colorScheme='green'
                              onClick={() => acceptBooking(req.id)}
                            >
                              Accept
                            </Button>
                            <Button
                              colorScheme='red'
                              variant='outline'
                              onClick={() => rejectBooking(req.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}



                        {req.status === 'confirmed' && (
                          <VStack>
                          <Badge colorScheme="green" fontSize="md" px={4} py={1} borderRadius="full">
                            Confirmed
                          </Badge>
                          <Text fontWeight="semibold">Rate Hirer:</Text>

                          <HStack>
                           {[1, 2, 3, 4, 5].map((rating) => (
                           <Button
                            key={rating}
                            size="sm"
                            colorScheme={req.rating === rating ? 'yellow' : 'gray'}
                            onClick={() => rateHirer(req.id, rating)}
                            >
                           {rating}★
                           </Button>
                           ))}
                         </HStack>

                         </VStack>
                        )}
                        {req.status === 'rejected' && (
                          <Badge colorScheme="red" fontSize="md" px={4} py={1} borderRadius="full">
                            Rejected
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  );
                })}
              </SimpleGrid>
            )}
          </TabPanel>
            
          <TabPanel>
            <Heading size="lg" mb={8}>Hirer Insights</Heading>

            {/* Most Chosen */}
            <Box mb={10}>
              <Heading size="md" mb={4}>Most Chosen Applicants</Heading>
              {mostChosen.length === 0 ? (
                <Text color="gray.500">No data yet.</Text>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {mostChosen.map((hirer, i) => (
                    <HStack key={i} bg="white" p={4} borderRadius="xl" boxShadow="sm">
                      <Text fontWeight="bold" color="green.500" w="30px">#{i + 1}</Text>
                      <Box flex={1}>
                        <Text fontWeight="semibold">{hirer.name}</Text>
                      </Box>
                      <Text fontWeight="bold" color="green.600">
                        {hirer.accepted} accepted
                      </Text>
                      <Box w="140px">
                        <Progress value={(hirer.accepted / hirer.total) * 100} colorScheme="green" borderRadius="full" />
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>

            {/* Least Chosen */}
            <Box mb={10}>
              <Heading size="md" mb={4}>Least Chosen Applicants</Heading>
              {leastChosen.length === 0 ? (
                <Text color="gray.500">No data yet.</Text>
              ) : (
                <VStack align="stretch" spacing={4}>
                  {leastChosen.map((hirer, i) => (
                    <HStack key={i} bg="white" p={4} borderRadius="xl" boxShadow="sm">
                      <Text fontWeight="bold" color="orange.500" w="30px">#{i + 1}</Text>
                      <Box flex={1}>
                        <Text fontWeight="semibold">{hirer.name}</Text>
                      </Box>
                      <Text fontWeight="bold" color="orange.600">
                        {hirer.accepted} accepted
                      </Text>
                      <Box w="140px">
                        <Progress value={(hirer.accepted / hirer.total) * 100} colorScheme="orange" borderRadius="full" />
                      </Box>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Box>

            {/* Never Selected */}
            <Box>
              <Heading size="md" mb={4}>Applicants Never Selected</Heading>
              {neverSelected.length === 0 ? (
                <Text color="gray.500">All hirers have been selected at least once.</Text>
              ) : (
                <SimpleGrid columns={[1, 2]} spacing={4}>
                  {neverSelected.map((hirer) => (
                    <Box key={hirer.name} bg="white" p={5} borderRadius="xl" boxShadow="sm">
                      <Text fontWeight="semibold">{hirer.name}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
