'use client';

import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { REVIEW_API, apiFetch } from '@/lib/api';

type Review = {
  id?: number;
  venueId: number;
  rating: number;
  comment: string;
};

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
      <Heading size="lg">Reviews</Heading>
      <Text>
        {averageRating} / 5 ({reviews.length} reviews)
      </Text>

      {reviews.length === 0 && <Text>No reviews yet.</Text>}
    </Box>
  );
}

