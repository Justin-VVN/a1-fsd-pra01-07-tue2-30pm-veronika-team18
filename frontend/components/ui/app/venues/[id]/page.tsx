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
} from '@chakra-ui/react';
import { AddIcon, MinusIcon } from '@chakra-ui/icons';
import { AppContext } from '@/app/store/ContextProvider';

import VenueReviews from '@/app/venueReviews'; //importing the venueReviews component for display
import WriteReview from '@/app/writeVenueReview';
import { log } from 'console';

export default function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentUser } = use(AppContext);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
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



  useEffect(() => {
    const savedVenues = localStorage.getItem('vv_venues');
    let allVenues: Venue[] = savedVenues ? JSON.parse(savedVenues) : venues;

    const found = allVenues.find((v) => v.id === Number(id));
    if (!found) notFound();
    setVenue(found);

    console.log('venue:', found);
  }, [id]);

  const nights =
    checkIn && checkOut
      ? Math.max(
        0,
        Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
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

  const driverLicenceInputRef = useRef(null);
  const insuranceInputRef = useRef(null);
  const businessCertInputRef = useRef(null);

  // Additional documents
  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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

    let driverBase64 = null;
    let insuranceBase64 = null;
    let businessCertBase64 = null;

    if (driverLicenceInputRef.current?.files?.[0]) {
      driverBase64 = await toBase64(driverLicenceInputRef.current.files[0]);
      // console.log('file:', driverLicenceInputRef.current.files[0]);
    }
    if (insuranceInputRef.current?.files?.[0]) {
      insuranceBase64 = await toBase64(insuranceInputRef.current.files[0]);
      // console.log('file:', insuranceInputRef.current.files[0]);
    }
    if (businessCertInputRef.current?.files?.[0]) {
      businessCertBase64 = await toBase64(businessCertInputRef.current.files[0]);
      // console.log('file:', businessCertInputRef.current.files[0]);
    }



    // if (driverLicenceInputRef.current) {
    //   setCreditStar(0);
    //   // console.log('file:', driverLicenceInputRef.current.files[0]); // File object
    //   const file = driverLicenceInputRef.current.files[0];
    //   if (!file) return;

    //   base64 = await toBase64(file);
    //   // console.log('base64:', base64);

    // }

    const additionalDocuments = {
      driverLicense: driverBase64,
      publicLiabilityInsurance: insuranceBase64,
      businessCertificate: businessCertBase64,
      abnNumber: isBusiness ? abnNumber : null,
    };

    const docCount = Object.values(additionalDocuments).filter(Boolean).length - (isBusiness ? 1 : 0);
    let finalCreditStar = 0;
    if (docCount === 1) finalCreditStar = 1;
    if (docCount === 2) finalCreditStar = 3;
    if (docCount >= 3) finalCreditStar = 5;



    // auto calculate credit score based on the number of docs provided
    // if 1 document: credit: 1
    // if 2 docs: credit = 3
    // if 3: credit = 5

    const bookings = JSON.parse(localStorage.getItem('vv_bookings') || '[]');
    const newBooking = {
      id: Date.now(),
      hirer: currentUser,
      venue: venue,
      checkIn,
      checkOut,
      nights,
      guests,
      eventName,
      eventTime,
      duration,
      pricePerNight,
      total: totalAfterDiscount,
      status: 'pending',
      additionalDocuments,
      creditStar: finalCreditStar,
    };

    bookings.push(newBooking);
    localStorage.setItem('vv_bookings', JSON.stringify(bookings));

    toast({
      title: 'Reservation request submitted!',
      description: `Booking for ${venue?.name} has been saved.`,
      status: 'success',
      duration: 5000,
    });

    // Reset form
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    setDiscount({ valid: false, percentage: 0, amount: 0 });
    setCreditStar(0);
    setIsBusiness(false); setAbnNumber('');
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
            Owner: {venue.owner.name}
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
                <Input
                  type='date'
                  min={minStartDate}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Checkout</FormLabel>
                <Input
                  type='date'
                  min={checkIn || minStartDate}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
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
