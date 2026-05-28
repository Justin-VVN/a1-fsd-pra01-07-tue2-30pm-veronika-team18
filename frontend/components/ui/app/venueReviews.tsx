'use client';

import {Box, Heading, Text} from '@chakra-ui/react';

type Review = {
  id: number;
  venueId: number;
  rating: number;
  comment: string;
};

export default function VenueReviews({ venueId }: { venueId: number }) {
  let reviews: Review[] = []; // empty list to hold reviews


  if (typeof window !== 'undefined') { //to check if we're in the browser, fetching reviews from localStorage
    //loads reviews from localStorage
    const savedReviews = localStorage.getItem('vv_reviews');
    if (savedReviews) {
        reviews = JSON.parse(savedReviews);
    }
}

//filter reviews for only the current venue 
const venueReviews = reviews.filter(review => review.venueId === venueId);

//calcuating the average rating
const averageRating = venueReviews.length > 0
? (venueReviews.reduce((sum, review) => sum + review.rating, 0) / venueReviews.length).toFixed(1)
: '0';


//ratings and reviews layout
return (
  <Box mt={16}>
    <Heading size="lg">Reviews</Heading>
    <Text>
      {averageRating} / 5 ({venueReviews.length} reviews)
    </Text>

    {venueReviews.length === 0 && (
      <Text>No reviews yet.</Text>
    )}
  </Box>
);



}




