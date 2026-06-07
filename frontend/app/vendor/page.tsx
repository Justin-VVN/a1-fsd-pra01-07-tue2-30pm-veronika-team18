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
  Checkbox,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';
import { VENUE_API, BOOKING_API, USER_API, apiFetch } from '@/lib/api';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

export default function VenuesPage() {
  const { currentUser } = useContext(AppContext);
  const router = useRouter();
  const toast = useToast();

  const [myVenues, setMyVenues] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const SUITABILITY_OPTIONS = ['Tennis', 'Dinner', 'Classical Music', 'Rock Concert', 'Birthday', 'Wedding'];

  const [editingVenue, setEditingVenue] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', imgSrc: '', location: '', capacity: '', price: '' });
  const [editSuitability, setEditSuitability] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    imgSrc: '',
    location: '',
    capacity: '',
    price: '',
  });
  const [formSuitability, setFormSuitability] = useState<string[]>([]);
  const [formCustomTag, setFormCustomTag] = useState('');
  const [editCustomTag, setEditCustomTag] = useState('');

  const toggleSuitability = (list: string[], setList: (v: string[]) => void, tag: string) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const addCustomTag = (list: string[], setList: (v: string[]) => void, input: string, setInput: (v: string) => void) => {
    const tag = input.trim();
    if (tag && !list.includes(tag)) setList([...list, tag]);
    setInput('');
  };

  //Blocked dates component useStates
  const [blockedDates, setBlockedDates] = useState<any[]>([]);
  const [blockForm, setBlockForm] = useState({
    venueId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'lastMonth' | 'allTime'>('allTime');

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
  const handleBlockVenue = async () => {
    if (!editingVenue || !blockForm.startDate || !blockForm.endDate) {
      toast({ title: 'Fill in start and end date', status: 'warning' });
      return;
    }

    const newBlockedPeriod = {
      venueId: Number(editingVenue.id),
      startDate: blockForm.startDate,
      endDate: blockForm.endDate,
      reason: blockForm.reason,
    };

    try {
      const saved = await apiFetch<any>(`${VENUE_API}/blocked-dates`, {
        method: 'POST',
        body: JSON.stringify(newBlockedPeriod),
      });
      setBlockedDates((prev) => [...prev, saved]);
      setBlockForm({ venueId: '', startDate: '', endDate: '', reason: '' });
      toast({ title: 'Timeslot blocked', status: 'success' });
    } catch (err) {
      console.error('Failed to save blocked date:', err);
      toast({ title: 'Failed to block timeslot', status: 'error' });
    }
  };

  const handleUnblockDate = async (blockedDateId: number) => {
    try {
      await apiFetch(`${VENUE_API}/blocked-dates/${blockedDateId}`, { method: 'DELETE' });
      setBlockedDates((prev) => prev.filter((d) => d.id !== blockedDateId));
      toast({ title: 'Timeslot unblocked', status: 'info', duration: 2000 });
    } catch (err) {
      console.error('Failed to unblock date:', err);
      toast({ title: 'Could not unblock timeslot', status: 'error' });
    }
  };


//data preparation for the DI Hirer graphs
const colours = [
  '#3182CE',
  '#38A169',
  '#DD6B20',
  '#805AD5',
  '#E53E3E',
];

//returning the hirer's name for displaying in charts
const getHirerName = (booking: any) => {
  if (booking.hirer?.fullName) return booking.hirer.fullName;
  if (booking.hirer?.name) return booking.hirer.name;
  return `Hirer ${booking.hirerId}`;
};

// filter bookings by selected time window
const filteredBookings = bookingRequests.filter((b: any) => {
  if (timeFilter === 'allTime') return true;
  const dateStr = b.checkIn ?? b.createdAt;
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const now = new Date();
  if (timeFilter === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }
  if (timeFilter === 'month') {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }
  if (timeFilter === 'lastMonth') {
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
  }
  return true;
});

//getting the list of hirers who have made bookings
const hirerNames = Array.from(
  new Set(filteredBookings.map((booking) => getHirerName(booking)))
);

//counting how many times each hirer has applied for each venue
const venueTallies = myVenues.map((venue) => {
  const venueData: any = {
    venue: venue.name,
  };

  filteredBookings
    .filter(
      (booking) =>
        String(booking.venue?.id ?? booking.venueId) === String(venue.id)
    )
    .forEach((booking) => {
      const hirerName = getHirerName(booking);
      venueData[hirerName] = (venueData[hirerName] || 0) + 1;
    });

  return venueData;
});

//count bookings for each hirer
const combinedTallies = hirerNames.map((hirerName) => {
  const hirerBookings = filteredBookings.filter(
    (booking) => getHirerName(booking) === hirerName
  );

  return {
    hirer: hirerName,
    accepted: hirerBookings.filter((booking) => booking.status === 'confirmed').length,
    rejected: hirerBookings.filter((booking) => booking.status === 'rejected').length,
    pending: hirerBookings.filter((booking) => booking.status === 'pending').length,
  };
});

//data for most & least active hirer pie chart
const pieData = hirerNames.map((hirerName) => ({
  name: hirerName,
  value: filteredBookings.filter((booking) => getHirerName(booking) === hirerName).length,
}));

//venue utilisation by month
const utilisationData = Object.values(
  filteredBookings.reduce((acc: any, booking: any) => {
    const bookingDate = booking.checkIn ?? booking.createdAt;

    if (!bookingDate) return acc;

    const date = new Date(bookingDate);

    const month = date.toLocaleString('default', {
      month: 'short',
      year: '2-digit',
    });

    if (!acc[month]) {
      acc[month] = { month, bookings: 0 };
    }

    acc[month].bookings += 1;

    return acc;
  }, {})
);
  
  const handleEditClick = (venue: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVenue(venue);
    setEditForm({
      name: venue.name,
      imgSrc: venue.imgSrc,
      location: venue.location,
      capacity: String(venue.capacity),
      price: String(venue.price),
    });
    setEditSuitability(Array.isArray(venue.suitability) ? venue.suitability : []);
  };

  const handleUpdateVenue = async () => {
    if (!editingVenue) return;
    try {
      const updated = await apiFetch<any>(`${VENUE_API}/venues/${editingVenue.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editForm.name,
          imgSrc: editForm.imgSrc,
          location: editForm.location,
          capacity: Number(editForm.capacity),
          price: Number(editForm.price),
          ownerId: currentUser.id,
          suitability: editSuitability,
        }),
      });
      setMyVenues((prev) => prev.map((v) => (v.id === editingVenue.id ? { ...v, ...updated } : v)));
      setEditingVenue(null);
      toast({ title: 'Venue updated', status: 'success', duration: 2000 });
    } catch (err) {
      console.error('Failed to update venue:', err);
      toast({ title: 'Could not update venue', status: 'error' });
    }
  };

  const handleDeleteVenue = async (venueId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this venue?')) return;
    try {
      await apiFetch(`${VENUE_API}/venues/${venueId}`, { method: 'DELETE' });
      setMyVenues((prev) => prev.filter((v) => v.id !== venueId));
      toast({ title: 'Venue deleted', status: 'info', duration: 2000 });
    } catch (err) {
      console.error('Failed to delete venue:', err);
      toast({ title: 'Could not delete venue', status: 'error' });
    }
  };

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
      suitability: formSuitability,
    };

    try {
      const created = await apiFetch<any>(`${VENUE_API}/venues`, {
        method: 'POST',
        body: JSON.stringify(newVenue),
      });
      setMyVenues((prev) => [...prev, created]);

      toast({ title: 'Venue posted!', status: 'success' });
      setForm({ name: '', imgSrc: '', location: '', capacity: '', price: '' });
      setFormSuitability([]);
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
        Vendor Dashboard – Welcome, {currentUser.fullName}!
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
                  <FormControl>
                    <FormLabel>Recommended Suitability</FormLabel>
                    <Wrap spacing={3} mb={3}>
                      {SUITABILITY_OPTIONS.map((tag) => (
                        <WrapItem key={tag}>
                          <Checkbox
                            isChecked={formSuitability.includes(tag)}
                            onChange={() => toggleSuitability(formSuitability, setFormSuitability, tag)}
                          >
                            {tag}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                    <HStack mb={2}>
                      <Input
                        placeholder="Add custom keyword…"
                        value={formCustomTag}
                        onChange={(e) => setFormCustomTag(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(formSuitability, setFormSuitability, formCustomTag, setFormCustomTag); } }}
                        size="sm"
                      />
                      <Button size="sm" colorScheme="teal" onClick={() => addCustomTag(formSuitability, setFormSuitability, formCustomTag, setFormCustomTag)}>
                        Add
                      </Button>
                    </HStack>
                    {formSuitability.filter((t) => !SUITABILITY_OPTIONS.includes(t)).length > 0 && (
                      <Wrap spacing={2}>
                        {formSuitability.filter((t) => !SUITABILITY_OPTIONS.includes(t)).map((tag) => (
                          <WrapItem key={tag}>
                            <Badge colorScheme="teal" px={2} py={1} borderRadius="full" cursor="pointer"
                              onClick={() => setFormSuitability(formSuitability.filter((t2) => t2 !== tag))}>
                              {tag} ✕
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                    )}
                  </FormControl>
                  <Button type='submit' colorScheme='blue' size='lg'>
                    Post Venue
                  </Button>
                </VStack>
              </form>
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
                    cursor='pointer'
                    onClick={() => router.push(`/venues/${venue.id}`)}
                    _hover={{ boxShadow: 'xl', transform: 'translateY(-2px)', transition: 'all 0.2s' }}
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
                      <HStack mt={4} spacing={2}>
                        <Button size='sm' colorScheme='blue' onClick={(e) => handleEditClick(venue, e)}>
                          Edit
                        </Button>
                        <Button size='sm' colorScheme='red' variant='outline' onClick={(e) => handleDeleteVenue(venue.id, e)}>
                          Delete
                        </Button>
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
                      {/* Header row: venue image + summary */}
                      <HStack align='start' mb={4}>
                        <Image
                          src={req.venue.imgSrc}
                          alt=''
                          boxSize='90px'
                          borderRadius='lg'
                          objectFit='cover'
                          flexShrink={0}
                        />
                        <Box flex={1}>
                          <HStack justify='space-between' align='start'>
                            <Heading size='md'>{req.venue.name}</Heading>
                            <Badge
                              colorScheme={req.status === 'confirmed' ? 'green' : req.status === 'rejected' ? 'red' : 'yellow'}
                              fontSize='sm' px={3} py={1} borderRadius='full' textTransform='capitalize'
                            >
                              {req.status}
                            </Badge>
                          </HStack>
                          <Text color='gray.500' fontSize='sm'>
                            Booking #{req.id} · Submitted {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}
                          </Text>
                          <Text mt={1} fontWeight='semibold'>
                            Hirer: {req.hirer?.fullName ?? req.hirer?.name ?? 'Unknown'}
                          </Text>
                          <Text fontSize='sm' color='gray.600'>{req.hirer?.email ?? ''}</Text>
                        </Box>
                      </HStack>

                      <Divider mb={3} />

                      {/* Booking details grid */}
                      <SimpleGrid columns={2} spacing={2} mb={3}>
                        <Box>
                          <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Check-in</Text>
                          <Text fontWeight='medium'>{req.checkIn}</Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Check-out</Text>
                          <Text fontWeight='medium'>{req.checkOut}</Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Nights</Text>
                          <Text fontWeight='medium'>{req.nights}</Text>
                        </Box>
                        <Box>
                          <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Guests</Text>
                          <Text fontWeight='medium'>{req.guests}</Text>
                        </Box>
                        {req.eventName && (
                          <Box>
                            <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Event</Text>
                            <Text fontWeight='medium'>{req.eventName}</Text>
                          </Box>
                        )}
                        {req.eventTime && (
                          <Box>
                            <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Event Time</Text>
                            <Text fontWeight='medium'>{req.eventTime}</Text>
                          </Box>
                        )}
                        {req.eventDuration && (
                          <Box>
                            <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Duration</Text>
                            <Text fontWeight='medium'>{req.eventDuration} hrs</Text>
                          </Box>
                        )}
                        {req.preferenceRank && (
                          <Box>
                            <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Preference Rank</Text>
                            <Text fontWeight='medium'>#{req.preferenceRank}</Text>
                          </Box>
                        )}
                        <Box>
                          <Text fontSize='xs' color='gray.500' fontWeight='semibold' textTransform='uppercase'>Total</Text>
                          <Text fontWeight='bold' color='green.600'>${req.total}</Text>
                        </Box>
                      </SimpleGrid>

                      <Divider mb={3} />
                      <HStack mb={2}>
                        <Text fontWeight="semibold">Hirer Credibility:</Text>
                        <StarRating score={score} />
                        <Text fontSize="sm" color="gray.500">({score}/5)</Text>
                      </HStack>

                      <HStack mb={3}>
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
            <HStack justify="space-between" align="center" mb={6}>
              <Heading size="lg">Visual Analytics</Heading>
              <HStack spacing={2}>
                {(['week', 'month', 'lastMonth', 'allTime'] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    colorScheme="blue"
                    variant={timeFilter === f ? 'solid' : 'outline'}
                    onClick={() => setTimeFilter(f)}
                  >
                    {f === 'week' ? 'This Week' : f === 'month' ? 'This Month' : f === 'lastMonth' ? 'Last Month' : 'All Time'}
                  </Button>
                ))}
              </HStack>
            </HStack>

            <SimpleGrid columns={[1, 1, 2]} spacing={8}>
              <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={4}>Hirer Tallies by Venue</Heading>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={venueTallies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="venue" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    {hirerNames.map((hirer, index) => (
                      <Bar key={hirer} dataKey={hirer} fill={colours[index % colours.length]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={4}>Combined Hirer Booking Status</Heading>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={combinedTallies}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hirer" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="accepted" stackId="a" fill="#38A169" />
                    <Bar dataKey="pending" stackId="a" fill="#DD6B20" />
                    <Bar dataKey="rejected" stackId="a" fill="#E53E3E" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={4}>Most and Least Active Hirers</Heading>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
                      {pieData.map((entry, index) => (
                        <Cell key={entry.name} fill={colours[index % colours.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
                <Heading size="md" mb={4}>Venue Utilisation Over Time</Heading>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={utilisationData as any[]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="bookings" stroke="#3182CE" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Edit Venue Modal */}
      <Modal isOpen={!!editingVenue} onClose={() => setEditingVenue(null)} size='xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Venue — {editingVenue?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align='stretch'>
              <FormControl>
                <FormLabel>Venue Name</FormLabel>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Image URL</FormLabel>
                <Input value={editForm.imgSrc} onChange={(e) => setEditForm({ ...editForm, imgSrc: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Location</FormLabel>
                <Input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </FormControl>
              <HStack>
                <FormControl>
                  <FormLabel>Capacity</FormLabel>
                  <Input type='number' value={editForm.capacity} onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>Price / night</FormLabel>
                  <Input type='number' value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Recommended Suitability</FormLabel>
                <Wrap spacing={3} mb={3}>
                  {SUITABILITY_OPTIONS.map((tag) => (
                    <WrapItem key={tag}>
                      <Checkbox
                        isChecked={editSuitability.includes(tag)}
                        onChange={() => toggleSuitability(editSuitability, setEditSuitability, tag)}
                      >
                        {tag}
                      </Checkbox>
                    </WrapItem>
                  ))}
                </Wrap>
                <HStack mb={2}>
                  <Input
                    placeholder="Add custom keyword…"
                    value={editCustomTag}
                    onChange={(e) => setEditCustomTag(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(editSuitability, setEditSuitability, editCustomTag, setEditCustomTag); } }}
                    size="sm"
                  />
                  <Button size="sm" colorScheme="teal" onClick={() => addCustomTag(editSuitability, setEditSuitability, editCustomTag, setEditCustomTag)}>
                    Add
                  </Button>
                </HStack>
                {editSuitability.filter((t) => !SUITABILITY_OPTIONS.includes(t)).length > 0 && (
                  <Wrap spacing={2}>
                    {editSuitability.filter((t) => !SUITABILITY_OPTIONS.includes(t)).map((tag) => (
                      <WrapItem key={tag}>
                        <Badge colorScheme="teal" px={2} py={1} borderRadius="full" cursor="pointer"
                          onClick={() => setEditSuitability(editSuitability.filter((t2) => t2 !== tag))}>
                          {tag} ✕
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}
              </FormControl>

              <Divider mt={2} />

              <Heading size='sm'>Block Timeslot</Heading>
              <HStack>
                <FormControl>
                  <FormLabel>Start Date</FormLabel>
                  <Input type='date' value={blockForm.startDate} onChange={(e) => setBlockForm({ ...blockForm, startDate: e.target.value })} />
                </FormControl>
                <FormControl>
                  <FormLabel>End Date</FormLabel>
                  <Input type='date' value={blockForm.endDate} onChange={(e) => setBlockForm({ ...blockForm, endDate: e.target.value })} />
                </FormControl>
              </HStack>
              <FormControl>
                <FormLabel>Reason (optional)</FormLabel>
                <Input value={blockForm.reason} onChange={(e) => setBlockForm({ ...blockForm, reason: e.target.value })} placeholder='e.g. maintenance' />
              </FormControl>
              <Button colorScheme='orange' onClick={handleBlockVenue}>Block Timeslot</Button>

              {blockedDates.filter((d) => String(d.venueId ?? d.venue?.id) === String(editingVenue?.id)).length > 0 && (
                <>
                  <Divider />
                  <Heading size='sm'>Blocked Timeslots</Heading>
                  <VStack align='stretch' spacing={2}>
                    {blockedDates
                      .filter((d) => String(d.venueId ?? d.venue?.id) === String(editingVenue?.id))
                      .map((d) => (
                        <HStack key={d.id} justify='space-between' bg='orange.50' p={2} borderRadius='md'>
                          <Text fontSize='sm'>{new Date(d.startDate).toLocaleDateString()} → {new Date(d.endDate).toLocaleDateString()}{d.reason ? ` (${d.reason})` : ''}</Text>
                          <Button size='xs' colorScheme='red' variant='outline' onClick={() => handleUnblockDate(d.id)}>Unblock</Button>
                        </HStack>
                      ))}
                  </VStack>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleUpdateVenue}>Save Changes</Button>
            <Button variant='ghost' onClick={() => setEditingVenue(null)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
