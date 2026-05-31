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
  useEffect(() => {
  const storedUser = localStorage.getItem('vv_currentUser');

  if (!storedUser) {
    router.push('/signin');
    return;
  }

  const user = JSON.parse(storedUser);

  if (user.role !== 'vendor') {
    router.push('/users');
  }
  }, [router]);



  // Load my posted venues
  useEffect(() => {
    if (!currentUser?.id) return;
    const saved = localStorage.getItem('vv_venues') || '[]';
    const all = JSON.parse(saved);
    setMyVenues(all.filter((v: any) => v.owner?.id === currentUser.id));
  }, [currentUser]);

  // Load booking requests for my venues
  useEffect(() => {
    if (!currentUser?.id) return;
    const saved = localStorage.getItem('vv_bookings') || '[]';
    const allBookings = JSON.parse(saved);
    const mine = allBookings.filter(
      (b: any) => b.venue.owner?.id === currentUser.id,
    );
    setBookingRequests(mine);
  }, [currentUser]);


  //Load blocked dates for my venues
  useEffect(() => {
    const savedBlockedDates = localStorage.getItem('vv_blocked_dates') || '[]';
    setBlockedDates(JSON.parse(savedBlockedDates));
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
  const allBookings = JSON.parse(localStorage.getItem('vv_bookings') || '[]');

  return allBookings.filter(
    (booking: any) => booking.hirer?.id === hirerId
  );
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

    const savedBlockedDates = JSON.parse(
      localStorage.getItem('vv_blocked_dates') || '[]'
    );

    savedBlockedDates.push(newBlockedPeriod);
    localStorage.setItem(
      'vv_blocked_dates',
      JSON.stringify(savedBlockedDates)
    );

    setBlockedDates(savedBlockedDates);

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
      const hirerId = req.hirer?.id || req.hirer.name;
      const hirerName = req.hirer.name || 'Unknown Hirer';

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
  
  const handlePostVenue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newVenue = {
      id: Date.now(),
      name: form.name,
      imgSrc: form.imgSrc,
      location: form.location,
      capacity: Number(form.capacity),
      price: Number(form.price),
      owner: currentUser,
    };

    const saved = JSON.parse(localStorage.getItem('vv_venues') || '[]');
    saved.push(newVenue);
    localStorage.setItem('vv_venues', JSON.stringify(saved));
    setMyVenues((prev) => [...prev, newVenue]);

    toast({ title: 'Venue posted!', status: 'success' });
    setForm({ name: '', imgSrc: '', location: '', capacity: '', price: '' });
  };

  const acceptBooking = (bookingId: number) => {
    const allBookings = JSON.parse(localStorage.getItem('vv_bookings') || '[]');
    const updated = allBookings.map((b: any) =>
      b.id === bookingId ? { ...b, status: 'confirmed'} : b,
    );
    localStorage.setItem('vv_bookings', JSON.stringify(updated));
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'confirmed'} : b)),
    );
    toast({ title: 'Booking accepted!', status: 'success' });
  };

  const rejectBooking = (bookingId: number) => {
    const allBookings = JSON.parse(localStorage.getItem('vv_bookings') || '[]');
    const updated = allBookings.map((b: any) =>
      b.id === bookingId ? { ...b, status: 'rejected' } : b,
    );
    localStorage.setItem('vv_bookings', JSON.stringify(updated));
    setBookingRequests(updated);
    toast({ title: 'Booking rejected', status: 'info' });
  };

  if (!currentUser || currentUser.role !== 'vendor') return <Text p={8}>Redirecting...</Text>;
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
                          <Badge colorScheme="green" fontSize="md" px={4} py={1} borderRadius="full">
                            Confirmed
                          </Badge>
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
