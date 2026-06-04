'use client';

import { Box, Button, FormControl, FormLabel, Select, Textarea, VStack, useToast } from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { REVIEW_API, apiFetch } from '@/lib/api';
import { AppContext } from './store/ContextProvider';

type Review = {
  id?: number;
  venueId: number;
  hirerId?: string;
  rating: number;
  comment: string;
};

export default function WriteReview({ venueId }: { venueId: number }) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const toast = useToast();
  const { currentUser } = useContext(AppContext);
   
  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast({ title: 'Please enter your rating and comment.', status: 'warning' });
      return;
    }

    const newReview: Review = {
      venueId,
      hirerId: currentUser?.id,
      rating: Number(rating),
      comment: comment.trim(),
    };

    try {
      await apiFetch<any>(`${REVIEW_API}/reviews`, {
        method: 'POST',
        body: JSON.stringify(newReview),
      });
      setRating('');
      setComment('');
      toast({ title: 'Review submitted!', status: 'success' });
    } catch (err) {
      console.error('Failed to submit review:', err);
      toast({ title: 'Failed to submit review', status: 'error' });
    }
  };

return (
  <Box mt={8}>
    <VStack spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Rating out of Five Stars</FormLabel>
        <Select
          placeholder="Select rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </Select>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Comment</FormLabel>
        <Textarea
          placeholder="Write your review here"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </FormControl>

      <Button colorScheme="blue" onClick={handleSubmitReview}>
        Submit Review
      </Button>
    </VStack>
  </Box>
);


}