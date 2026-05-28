'use client';

import { useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Heading, FormControl, FormLabel, Input, Button, VStack, Text, useToast } from '@chakra-ui/react';
import { AppContext } from '../store/ContextProvider';
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const toast = useToast();
  const { currentUser, setCurrentUser } = useContext(AppContext);

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('vv_users') || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (user) {
      const { password, ...currUser } = user;
      localStorage.setItem('vv_currentUser', JSON.stringify(currUser));
      toast({ title: `Welcome back, ${user.name}!`, status: 'success' });
      setCurrentUser(currUser);
      router.push('/'); // redirect to home
    } else {
      toast({ title: 'Invalid email or password', status: 'error' });
    }
  };

  return (
    <Box maxW="400px" mx="auto" mt={12} p={8} boxShadow="lg" borderRadius="xl" bg="white">
      <Heading mb={6} textAlign="center" color="blue.600">Sign In</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={5}>
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormControl>

          <Button type="submit" colorScheme="blue" size="lg" w="full">
            Sign In
          </Button>

          <Text fontSize="sm">
            Don&apos;t have an account?{' '}
            <Button variant="link" colorScheme="blue" onClick={() => router.push('/signup')}>
              Sign Up
            </Button>
          </Text>
        </VStack>
      </form>
    </Box>
  );
}