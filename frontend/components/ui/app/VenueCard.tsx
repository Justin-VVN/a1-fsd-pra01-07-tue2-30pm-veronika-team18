'use client';

import { Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Text, Image, Box, VStack, Heading, Badge } from '@chakra-ui/react'
import Link from 'next/link';

export default function VenueCard(props) {
    const { venue } = props;

    return (
        <Link href={`/venues/${venue.id}`} style={{ textDecoration: 'none' }}>
            <Box
                className="venue-card"
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                boxShadow="md"
                transition="all 0.3s ease"
                _hover={{
                    boxShadow: 'xl',
                    transform: 'translateY(-8px)',
                }}
                h="full"
            >
                {/* Image */}
                <Image
                    src={venue.imgSrc}
                    alt={venue.name}
                    width="100%"
                    height="220px"
                    objectFit="cover"
                    draggable="false"
                />

                {/* Card Content */}
                <Box p={5}>
                    <VStack align="start" spacing={3}>
                        {/* Venue Name */}
                        <Heading size="md" noOfLines={2}>
                            {venue.name}
                        </Heading>

                        {/* Location + Capacity */}
                        <HStack wrap="wrap" gap={2}>
                            <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                                {venue.location}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                                {venue.capacity} guests
                            </Text>
                        </HStack>

                        {/* Price */}
                        <HStack justify="space-between" w="full">
                            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                                ${venue.price}
                                <Text as="span" fontSize="md" fontWeight="normal" color="gray.500">
                                    {' '} / night
                                </Text>
                            </Text>
                        </HStack>
                    </VStack>
                </Box>
            </Box>
        </Link>
    )
}
