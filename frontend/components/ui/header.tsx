'use client';

import Link from 'next/link';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flex, Box, Heading, Button, HStack, Spacer, Text } from '@chakra-ui/react';
import { AppContext } from '@/app/store/ContextProvider';

export default function Header() {
  // const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const { currentUser, setCurrentUser } = useContext(AppContext);

  // useEffect(() => {
  //   const user = localStorage.getItem('vv_currentUser');
  //   if (user) setCurrentUser(JSON.parse(user));
  // }, []);


  const handleSignOut = () => {
    localStorage.removeItem('vv_currentUser');
    setCurrentUser(null);
    router.push('/'); // go back to home
  };
  console.log(currentUser);
  
  return (
    <Box as="header" bg="blue.600" color="white" py={4} px={8} boxShadow="md">
      <Flex maxW="80vw" mx="auto" align="center">
        <Heading as="h1" size="lg" letterSpacing="tight">
          <Link href="/">Venue Vendors (VV)</Link>
        </Heading>

        <Spacer />
        <HStack spacing={6} fontWeight="medium">
          <Link href="/">Home</Link>
          <Link href="/vendor">Vendor</Link>
          <Link href="/bookings">My Bookings</Link>
        </HStack>

        <Spacer />

        <HStack spacing={4}>
          {currentUser ? (
            <>
              <Text fontWeight="medium" fontSize="lg">
                Welcome, <Link href={`/users/${currentUser.id}`}>{currentUser.name}</Link >
              </Text>
              <Button colorScheme="red" variant="solid"
              onClick={handleSignOut}
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button as={Link} href="/signup" colorScheme="white" variant="outline">
                Sign Up
              </Button>
              <Button as={Link} href="/signin" colorScheme="white" variant="outline">
                Sign In
              </Button>
            </>
          )}
        </HStack>
      </Flex>
    </Box>
  );
}