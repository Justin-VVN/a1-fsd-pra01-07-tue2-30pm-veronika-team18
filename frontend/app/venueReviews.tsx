'use client';

import { Box, Divider, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { REVIEW_API, apiFetch } from '@/lib/api';

type Review = {
  id?: number;
  venueId: number;
  rating: number;
  comment: string;
  reviewerId?: number;
  createdAt?: string;
};

const Stars = ({ rating }: { rating: number }) => (
  <Text color="yellow.400" fontSize="md" letterSpacing="1px">
    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
  </Text>
);

export default function VenueReviews({ venueId }: { venueId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState('0');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const allReviews = await apiFetch<Review[]>(`${REVIEW_API}/reviews`);
        const filtered = allReviews.filter((r) => r.venueId === venueId);
        setReviews(filtered);

        if (filtered.length > 0) {
          const avg = (
            filtered.reduce((sum, r) => sum + r.rating, 0) / filtered.length
          ).toFixed(1);
          setAverageRating(avg);
        } else {
          setAverageRating('0');
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
        setReviews([]);
        setAverageRating('0');
      }
    };

    fetchReviews();
  }, [venueId]);

  return (
    <Box mt={16}>
      <Heading size="lg" mb={1}>Reviews</Heading>
      <Text color="gray.500" mb={6}>
        {averageRating} / 5 &nbsp;·&nbsp; {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
      </Text>

      {reviews.length === 0 ? (
        <Text color="gray.400">No reviews yet. Be the first to leave one!</Text>
      ) : (
        <VStack align="stretch" spacing={4}>
          {reviews.map((r, i) => (
            <Box key={r.id ?? i} bg="gray.50" p={4} borderRadius="xl">
              <HStack mb={1}>
                <Stars rating={r.rating} />
                <Text fontSize="sm" color="gray.500" ml={1}>{r.rating}/5</Text>
              </HStack>
              <Text>{r.comment}</Text>
              {r.createdAt && (
                <Text fontSize="xs" color="gray.400" mt={2}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </Text>
              )}
              {i < reviews.length - 1 && <Divider mt={4} />}
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

