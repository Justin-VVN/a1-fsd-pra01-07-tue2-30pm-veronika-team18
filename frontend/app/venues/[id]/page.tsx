'use client';

import Venue from '@/app/types/Venue';
import { notFound } from 'next/navigation';
import { use, useEffect, useRef, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Image,
  Flex,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  IconButton,
  useToast,
  Divider,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  Select,
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { AppContext } from '@/app/store/ContextProvider';
import { VENUE_API, BOOKING_API, apiFetch } from '@/lib/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import VenueReviews from '@/app/venueReviews'; //importing the venueReviews component for display
import WriteReview from '@/app/writeVenueReview';

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser } = use(AppContext);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [blockedDates, setBlockedDates] = useState<{ startDate: string; endDate: string }[]>([]);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState({
    valid: false,
    percentage: 0,
    amount: 0,
  });
  const toast = useToast();

  //Section for Event details, time and duration
  const [eventName, setEventName] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [duration, setDuration] = useState('');

  const [isBusiness, setIsBusiness] = useState(false);
  const [abnNumber, setAbnNumber] = useState('');

  const [creditStar, setCreditStar] = useState(0);

  const [preferenceRank, setPreferenceRank] = useState(''); //for ranking booking preferences

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const found = await apiFetch<Venue>(`${VENUE_API}/venues/${id}`);
        if (!found) {
          notFound();
          return;
        }
        setVenue(found);
      } catch (err) {
        console.error('Failed to load venue:', err);
        notFound();
      }
    };

    fetchVenue();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    apiFetch<any[]>(`${VENUE_API}/blocked-dates`)
      .then((all) => setBlockedDates((all || []).filter((d) => String(d.venueId ?? d.venue?.id) === String(id))))
      .catch(() => setBlockedDates([]));
  }, [id]);

  // Build a flat array of every blocked Date for react-datepicker excludeDates
  const excludedDates: Date[] = blockedDates.flatMap((b) => {
    const dates: Date[] = [];
    const cur = new Date(b.startDate);
    const end = new Date(b.endDate);
    while (cur <= end) {
      dates.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  });

  const isRangeBlocked = (start: Date, end: Date) => {
    const s = start.getTime();
    const e = end.getTime();
    return blockedDates.some((d) => {
      const bs = new Date(d.startDate).getTime();
      const be = new Date(d.endDate).getTime();
      return s <= be && e >= bs;
    });
  };

  const nights =
    checkIn && checkOut
      ? Math.max(
        0,
        Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) /
          (1000 * 60 * 60 * 24),
        ),
      )
      : 0;

  const pricePerNight = venue?.price || 250;

  const campgroundFee = pricePerNight * nights;
  const serviceFee = guests * 2 * nights; // $2 per guest per night
  const totalBeforeTaxes = campgroundFee + serviceFee;
  const taxes = totalBeforeTaxes * 0.08; // 8% tax
  const totalAfterTaxes = totalBeforeTaxes + taxes;
  const totalAfterDiscount = discount.valid
    ? totalAfterTaxes - discount.amount
    : totalAfterTaxes;

  const minStartDate = new Date().toISOString().split('T')[0];

  const driverLicenceInputRef = useRef<HTMLInputElement | null>(null);
  const insuranceInputRef = useRef<HTMLInputElement | null>(null);
  const businessCertInputRef = useRef<HTMLInputElement | null>(null);


  // Additional documents
  const calculateCredibility = async () => {
    const files = [
      driverLicenceInputRef.current?.files?.[0],
      insuranceInputRef.current?.files?.[0],
      businessCertInputRef.current?.files?.[0],
    ].filter(Boolean);

    const docCount = files.length;

    let score = 0;
    if (docCount === 1) score = 1;
    else if (docCount === 2) score = 3;
    else if (docCount >= 3) score = 5;

    setCreditStar(score);
  };
  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      toast({ title: 'Please select both dates', status: 'error' });
      return;
    }
    if (nights <= 0) {
      toast({ title: 'Check-out must be after check-in', status: 'error' });
      return;
    }
    if (isRangeBlocked(checkIn!, checkOut!)) {
      toast({ title: 'Selected dates are unavailable', description: 'The venue is blocked during part or all of your selected dates.', status: 'error' });
      return;
    }

    if (!preferenceRank) {
    toast({ title: 'Please select a venue preference rank', status: 'error' });
    return;
    }

    if (!currentUser?.id) {
      toast({ title: 'You must be signed in to make a reservation', status: 'error' });
      return;
    }

    // Calculate credibility score from file inputs
    const fileInputs = [
      driverLicenceInputRef.current?.files?.[0],
      insuranceInputRef.current?.files?.[0],
      businessCertInputRef.current?.files?.[0],
    ].filter(Boolean);
    const docCount = fileInputs.length;
    let finalCreditStar = 0;
    if (docCount === 1) finalCreditStar = 1;
    if (docCount === 2) finalCreditStar = 3;
    if (docCount >= 3) finalCreditStar = 5;

    // Step 1: Create the booking (no file data in this request)
    const newBooking = {
      hirerId: currentUser.id,
      venueId: venue?.id,
      checkIn: checkIn!.toISOString().split('T')[0],
      checkOut: checkOut!.toISOString().split('T')[0],
      nights,
      guests,
      eventName,
      eventTime,
      eventDuration: duration,
      total: totalAfterDiscount,
      status: 'pending',
      preferenceRank: Number(preferenceRank),
    };

    let savedBooking: any;
    try {
      savedBooking = await apiFetch<any>(`${BOOKING_API}/bookings`, {
        method: 'POST',
        body: JSON.stringify(newBooking),
      });
    } catch (err) {
      console.error('Failed to submit reservation:', err);
      toast({
        title: 'Reservation failed',
        description: 'Could not submit booking. Please try again.',
        status: 'error',
      });
      return;
    }

    // Step 2: Upload each document file separately via multipart/form-data
    const documentUploads: { file: File; name: string; type: string; description?: string }[] = [];

    if (driverLicenceInputRef.current?.files?.[0]) {
      documentUploads.push({
        file: driverLicenceInputRef.current.files[0],
        name: "Driver's License",
        type: 'other',
      });
    }
    if (insuranceInputRef.current?.files?.[0]) {
      documentUploads.push({
        file: insuranceInputRef.current.files[0],
        name: 'Public Liability Insurance',
        type: 'policy',
      });
    }
    if (businessCertInputRef.current?.files?.[0]) {
      documentUploads.push({
        file: businessCertInputRef.current.files[0],
        name: 'Business Registration Certificate',
        type: 'contract',
        description: isBusiness && abnNumber ? `ABN: ${abnNumber}` : undefined,
      });
    }

    const token = localStorage.getItem('authToken');
    for (const doc of documentUploads) {
      const formData = new FormData();
      formData.append('file', doc.file);
      formData.append('bookingId', String(savedBooking.id));
      formData.append('uploadedById', String(currentUser.id));
      formData.append('venueId', String(venue?.id));
      formData.append('documentName', doc.name);
      formData.append('documentType', doc.type);
      if (doc.description) formData.append('description', doc.description);

      try {
        // Use raw fetch — do NOT set Content-Type so the browser sets the multipart boundary
        await fetch(`${BOOKING_API}/documents/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      } catch (err) {
        console.error(`Failed to upload ${doc.name}:`, err);
      }
    }

    toast({
      title: 'Reservation request submitted!',
      description: `Booking for ${venue?.name} has been saved.`,
      status: 'success',
      duration: 5000,
    });

    // Reset form
    setCheckIn(null);
    setCheckOut(null);
    setGuests(1);
    setDiscount({ valid: false, percentage: 0, amount: 0 });
    setCreditStar(finalCreditStar);
    setIsBusiness(false); setAbnNumber('');
    setPreferenceRank('');
    if (driverLicenceInputRef.current) driverLicenceInputRef.current.value = '';
    if (insuranceInputRef.current) insuranceInputRef.current.value = '';
    if (businessCertInputRef.current) businessCertInputRef.current.value = '';
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'VV20') {
      const discountAmount = totalAfterTaxes * 0.2;
      setDiscount({ valid: true, percentage: 20, amount: discountAmount });
      toast({ title: 'Discount applied!', status: 'success' });
    } else {
      setDiscount({ valid: false, percentage: 0, amount: 0 });
      toast({ title: 'Invalid code', status: 'error' });
    }
  };

  const StarRating = ({ score }: { score: number }) => (
    <Text fontSize="2xl" color="yellow.400" letterSpacing="1px">
      {'★'.repeat(score)}{'☆'.repeat(5 - score)}
    </Text>
  );

  if (!venue)
    return (
      <Box p={32}>
        <Text>Loading venue...</Text>
      </Box>
    );

  
  console.log('venue', venue);
  

  return (
    <Box maxW='7xl' mx='auto' px={8} py={12}>
      <Flex gap={12} flexWrap='wrap'>
        {/* Venue Info */}
        <Box flex='1' minW='400px'>
          <Image
            src={venue.imgSrc}
            alt={venue.name}
            w='full'
            h='500px'
            objectFit='cover'
            borderRadius='2xl'
            mb={6}
          />
          <Heading size='2xl' as="h2">{venue.name}</Heading>
          <HStack mb={4}>
            <Badge colorScheme='green' fontSize='md' px={3} py={1}>
              {venue.location}
            </Badge>
            <Text fontSize='lg'>Capacity: {venue.capacity} guests</Text>
          </HStack>
          <Text fontSize='lg' color='gray.700'>
            Owner: {venue.ownerFullname}  
          </Text>
          <Text fontSize='lg' color='gray.700'>
            Perfect for your next event in Melbourne.
          </Text>

          {/* Reviews section */}
          {venue && <VenueReviews venueId={venue.id} />}
          {venue && <WriteReview venueId={venue.id} />}
        </Box>

        {/* Reservation Card (exactly like your old component) */}
        <Box
          flex='1'
          minW='400px'
          maxW='480px'
          bg='white'
          borderRadius='2xl'
          boxShadow='2xl'
          p={8}
          h='fit-content'
          position='sticky'
          top={8}
        >
          <HStack justify='space-between' align='baseline' mb={6}>
            <Text fontSize='3xl' fontWeight='bold'>
              ${pricePerNight}{' '}
              <Text as='span' fontSize='lg' color='gray.500'>
                night
              </Text>
            </Text>
            {nights > 0 && (
              <Text fontSize='lg'>
                {nights} {nights === 1 ? 'night' : 'nights'}
              </Text>
            )}
          </HStack>

          <VStack spacing={6} align='stretch'>

            <Box>
              {/*event details section, with time and duration inputs*/}
              <Box>
                <Heading size="sm" mb={2}>Event Details</Heading>

                <FormControl mb={3}>
                  <FormLabel>Event Name</FormLabel>
                  <Input
                    placeholder="e.g. Birthday Party"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                  />
                </FormControl>
              </Box>

              <FormControl mb={3}>
                <FormLabel>Event Time</FormLabel>
                <Input
                  type='time'
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Duration (hours)</FormLabel>
                <Input
                  type='number'
                  placeholder='e.g. 4'
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </FormControl>
            </Box>
            {/* Dates */}
            <Flex gap={4}>
              <FormControl>
                <FormLabel>Check-in</FormLabel>
                <DatePicker
                  selected={checkIn}
                  onChange={(date: Date | null) => setCheckIn(date)}
                  excludeDates={excludedDates}
                  minDate={new Date()}
                  placeholderText='Select check-in'
                  dateFormat='yyyy-MM-dd'
                  customInput={<Input />}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Checkout</FormLabel>
                <DatePicker
                  selected={checkOut}
                  onChange={(date: Date | null) => setCheckOut(date)}
                  excludeDates={excludedDates}
                  minDate={checkIn ?? new Date()}
                  placeholderText='Select checkout'
                  dateFormat='yyyy-MM-dd'
                  customInput={<Input />}
                />
              </FormControl>
            </Flex>
            {/* Guests */}
            <FormControl>
              <FormLabel>Guests</FormLabel>
              <HStack
                bg='gray.50'
                borderRadius='xl'
                p={2}
                justify='space-between'
              >
                <IconButton
                  icon={<MinusIcon />}
                  aria-label='minus'
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  isDisabled={guests <= 1}
                />
                <Text
                  fontSize='2xl'
                  fontWeight='semibold'
                  w='12'
                  textAlign='center'
                >
                  {guests}
                </Text>
                <IconButton
                  icon={<AddIcon />}
                  aria-label='plus'
                  onClick={() => setGuests(guests + 1)}
                />
              </HStack>
            </FormControl>
            <Divider />

            {/*set preference rank based on the documents provided*/}
           <FormControl isRequired>
          <FormLabel>Venue Preference Rank</FormLabel>
          <Select
           placeholder="Select how strongly you prefer this venue"
           value={preferenceRank}
           onChange={(e) => setPreferenceRank(e.target.value)}
          >
          <option value="1">1 Low preference</option>
          <option value="2">2 Medium preference</option>
          <option value="3">3 Top preference</option>
         </Select>
          </FormControl>

            {/* Show Details Accordion */}
            {nights > 0 && (
              <Accordion defaultIndex={[0]} allowToggle>
                <AccordionItem>
                  <AccordionButton>
                    <Box flex='1' textAlign='left' fontWeight='medium'>
                      Show details
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel>
                    <VStack align='stretch' fontSize='sm' spacing={3}>
                      <HStack justify='space-between'>
                        <Text>Venue fee</Text>
                        <Text>${campgroundFee.toFixed(2)}</Text>
                      </HStack>
                      <HStack justify='space-between'>
                        <Text>
                          Service fee{' '}
                          <Text as='span' fontSize='xs' color='gray.500'>
                            ($2/guest/night)
                          </Text>
                        </Text>
                        <Text>${serviceFee.toFixed(2)}</Text>
                      </HStack>
                      <HStack justify='space-between'>
                        <Text>Taxes (8%)</Text>
                        <Text>${taxes.toFixed(2)}</Text>
                      </HStack>
                      <Divider />
                      <HStack justify='space-between' fontWeight='semibold'>
                        <Text>Subtotal</Text>
                        <Text>${totalAfterTaxes.toFixed(2)}</Text>
                      </HStack>

                      {/* Discount */}
                      <HStack>
                        <Input
                          placeholder='Discount code'
                          value={discountCode}
                          onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <Button colorScheme='blue' onClick={applyDiscount}>
                          Apply
                        </Button>
                      </HStack>
                      {discount.valid && (
                        <HStack justify='space-between' color='red.500'>
                          <Text>Discount ({discount.percentage}%)</Text>
                          <Text>-${discount.amount.toFixed(2)}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
            {/* Total */}
            <HStack justify='space-between' fontSize='xl' fontWeight='bold'>
              <Text>Total amount</Text>
              <Text>${totalAfterDiscount.toFixed(2)}</Text>
            </HStack>
            <FormControl mt={8}>
              <Text fontSize="xl" fontWeight="bold" mb={4}>Additional Documents</Text>

              {/* Driver's License */}
              <FormControl mb={4}>
                <FormLabel>Driver’s License (jpg)</FormLabel>
                <Input type="file" accept="image/*" ref={driverLicenceInputRef} onChange={calculateCredibility} />
              </FormControl>

              {/* Public Liability Insurance */}
              <FormControl mb={4}>
                <FormLabel>Public Liability Insurance Certificate (PDF)</FormLabel>
                <Input type="file" accept="application/pdf" ref={insuranceInputRef} onChange={calculateCredibility} />
              </FormControl>

              {/* Business / Organisation Checkbox */}
              <Checkbox
                isChecked={isBusiness}
                onChange={(e) => setIsBusiness(e.target.checked)}
                mb={3}
              >
                I am applying on behalf of a business / organisation
              </Checkbox>

              {isBusiness && (
                <VStack align="stretch" spacing={4} mt={2}>
                  <FormControl>
                    <FormLabel>ABN Number</FormLabel>
                    <Input
                      placeholder="e.g. 12 345 678 901"
                      value={abnNumber}
                      onChange={(e) => setAbnNumber(e.target.value)}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Certificate of Business Registration (PDF)</FormLabel>
                    <Input type="file" accept="application/pdf" ref={businessCertInputRef} onChange={calculateCredibility} />
                  </FormControl>
                </VStack>
              )}
            </FormControl>

            <HStack mt={4} align="center">
              <Text fontWeight="semibold">Your Credibility Score:</Text>
              <StarRating score={creditStar} />
              <Text fontSize="sm" color="gray.500">({creditStar}/5)</Text>
            </HStack>

            {/* Reserve Button */}
            <Button
              onClick={handleReserve}
              size='lg'
              h='64px'
              bg='black'
              color='white'
              fontSize='xl'
              _hover={{ bg: 'gray.800' }}
            >
              RESERVE →
            </Button>
          </VStack>
        </Box>
      </Flex>
    </Box>
  );
}
