'use client';

import { Box, Button, FormControl, FormLabel, Select, Textarea, VStack,} 
from '@chakra-ui/react';
import { useState } from 'react';

type Review = {
  id: number;
  venueId: number;
  rating: number;
  comment: string;
};

export default function WriteReview({ venueId }: { venueId: number }) {
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
   
   const handleSubmitReview = () => {
    if (!rating || !comment.trim()) {
      alert('Please enter your rating and comment.');
      return;
    }

 const savedReviews = localStorage.getItem('vv_reviews');
   let reviews: Review[] = [];

    if (savedReviews) {
  reviews = JSON.parse(savedReviews);
   }

     const newReview: Review = {
    id: Date.now(),
    venueId,
    rating: Number(rating),
    comment: comment.trim(),
    };

reviews.push(newReview);

localStorage.setItem('vv_reviews', JSON.stringify(reviews));
    setRating('');
    setComment('');
    alert('Review submitted!');
    window.location.reload();

}

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